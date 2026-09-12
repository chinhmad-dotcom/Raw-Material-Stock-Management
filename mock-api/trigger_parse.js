const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filePath = path.join(__dirname, 'uploads/BAO CAO HAP 06-2026.xlsx');
if (!fs.existsSync(filePath)) {
  console.log("File not found");
  process.exit(1);
}

const results = [];
const reportMonth = 6;
const reportYear = 2026;

const wb = XLSX.readFile(filePath, { cellDates: true });

const getDayRecord = (dateVal) => {
    let r = results.find(x => x.date === dateVal);
    if (!r) {
        r = {
            year: reportYear,
            month: reportMonth,
            date: dateVal,
            bapHap: { ton: 0, tonPerHour: 0, totalKWh: 0, kwhPerTon: 0 },
            nanhHap: { ton: 0, tonPerHour: 0, totalKWh: 0, kwhPerTon: 0 },
            oee: { average: 0, target: 0 },
            losses: [],
            warnings: []
        };
        results.push(r);
    }
    return r;
};

// Parse NL
if (wb.Sheets['NL']) {
    const sheetNL = XLSX.utils.sheet_to_json(wb.Sheets['NL'], { header: 1, defval: '' });
    let currentDate = -1;
    for (let i = 6; i < sheetNL.length; i++) {
        const row = sheetNL[i];
        if (!row) continue;
        
        if (row[0] !== '' && !isNaN(parseInt(row[0]))) {
            currentDate = parseInt(row[0]);
        }
        
        if (currentDate === -1) continue;
        
        const code = String(row[1] || '').toUpperCase().trim();
        if (!code) continue;
        
        const r = getDayRecord(currentDate);
        const ton = parseFloat(row[2]) || 0;
        const tonPerHour = parseFloat(row[4]) || 0;
        const totalKWh = parseFloat(row[11]) || 0;
        const kwhPerTon = parseFloat(row[12]) || 0;
        
        if (code === 'CORN') {
            r.bapHap.ton += ton;
            if (tonPerHour > 0) r.bapHap.tonPerHour = tonPerHour;
            r.bapHap.totalKWh += totalKWh;
            if (kwhPerTon > 0) r.bapHap.kwhPerTon = kwhPerTon;
        } else if (code === 'FFS') {
            r.nanhHap.ton += ton;
            if (tonPerHour > 0) r.nanhHap.tonPerHour = tonPerHour;
            r.nanhHap.totalKWh += totalKWh;
            if (kwhPerTon > 0) r.nanhHap.kwhPerTon = kwhPerTon;
        }
    }
}

// Parse OEE
if (wb.Sheets['OEE']) {
    const sheetOee = XLSX.utils.sheet_to_json(wb.Sheets['OEE'], { header: 1, defval: '' });
    for (let i = 4; i < sheetOee.length; i++) {
        const row = sheetOee[i];
        if (row && row.length > 1 && row[0] !== '' && !isNaN(parseFloat(row[0]))) {
            const dateVal = parseInt(row[0]);
            const r = getDayRecord(dateVal);
            
            let avgStr = String(row[16] || '').replace('%', '').replace(',', '.').trim();
            let targetStr = String(row[17] || '').replace('%', '').replace(',', '.').trim();
            
            let avg = parseFloat(avgStr) || 0;
            let target = parseFloat(targetStr) || 0;
            
            if (avg > 1) avg /= 100;
            if (target > 1) target /= 100;
            
            r.oee.average = avg;
            r.oee.target = target;
        }
    }
}

// Parse LOSS
if (wb.Sheets['LOSS']) {
    const sheetLoss = XLSX.utils.sheet_to_json(wb.Sheets['LOSS'], { header: 1, defval: '' });
    for (let i = 7; i < sheetLoss.length; i++) {
        const row = sheetLoss[i];
        if (!row) continue;
        
        const code = String(row[1] || '').trim();
        if (!code) continue;
        
        const desc = String(row[2] || '').trim();
        
        for (let d = 1; d <= 31; d++) {
            const startCol = 4 + (d - 1) * 6;
            // removed break
            
            const s1Count = parseInt(row[startCol]) || 0;
            const s1Time = parseFloat(row[startCol+1]) || 0;
            const s2Count = parseInt(row[startCol+2]) || 0;
            const s2Time = parseFloat(row[startCol+3]) || 0;
            const s3Count = parseInt(row[startCol+4]) || 0;
            const s3Time = parseFloat(row[startCol+5]) || 0;
            
            if (s1Count > 0 || s1Time > 0 || s2Count > 0 || s2Time > 0 || s3Count > 0 || s3Time > 0) {
                const r = getDayRecord(d);
                r.losses.push({
                    code: code,
                    description: desc,
                    occurrences: s1Count + s2Count + s3Count,
                    timeMins: s1Time + s2Time + s3Time
                });
            }
        }
    }
}


let lastCornEnd = null;
let lastFfsEnd = null;
let lastLineEnd = null;
let lastNghienEnd = null;

for (let d = 1; d <= 31; d++) {
    const sheetName = String(d);
    if (wb.Sheets[sheetName]) {
        const sheetDay = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
        const r = getDayRecord(d);
        
        for (let i = 7; i < Math.min(40, sheetDay.length); i++) {
            const row = sheetDay[i];
            if (row && row[0] !== '' && !isNaN(parseInt(row[0]))) {
                const shift = parseInt(row[0]);
                const nguyenLieu = String(row[1] || '').trim().toUpperCase();
                
                const checkMachine = (startCol, endCol, machineName, stateObj, key) => {
                    if (row.length > endCol) {
                        const startStr = String(row[startCol] || '');
                        const endStr = String(row[endCol] || '');
                        
                        const startVal = parseFloat(startStr);
                        const endVal = parseFloat(endStr);
                        
                        const hasStart = !isNaN(startVal) && startStr !== '';
                        const hasEnd = !isNaN(endVal) && endStr !== '';
                        
                        if (hasStart) {
                            if (stateObj[key] !== null && Math.abs(startVal - stateObj[key]) > 0.01) {
                                r.warnings.push({
                                    id: Math.random().toString(36).substr(2, 9),
                                    date: `${String(d).padStart(2, '0')}/${String(reportMonth).padStart(2, '0')}/${reportYear}`,
                                    shift: shift,
                                    machine: machineName,
                                    message: `L\u1EC7ch: \u0110\u1EA7u ca ${startVal} \u2260 Cu\u1ED1i ca tr\u01B0\u1EDBc ${stateObj[key]} (${Math.round((startVal - stateObj[key])*100)/100} kWh)`
                                });
                            }
                            stateObj[key] = hasEnd ? endVal : startVal;
                        } else if (hasEnd) {
                            stateObj[key] = endVal;
                        }
                    }
                };
                
                const state = { lastCornEnd, lastFfsEnd, lastLineEnd, lastNghienEnd };
                
                if (nguyenLieu === "CORN") {
                    checkMachine(32, 33, "M\u00C1Y H\u1EA4P CORN", state, 'lastCornEnd');
                } else if (nguyenLieu === "FFS" || nguyenLieu === "N\u00C0NH") {
                    checkMachine(32, 33, "M\u00C1Y H\u1EA4P FFS", state, 'lastFfsEnd');
                }
                
                checkMachine(38, 39, "\u0110I\u1EC6N LINE", state, 'lastLineEnd');
                checkMachine(41, 42, "M\u00C1Y NGHI\u1EC0N", state, 'lastNghienEnd');
                
                lastCornEnd = state.lastCornEnd;
                lastFfsEnd = state.lastFfsEnd;
                lastLineEnd = state.lastLineEnd;
                lastNghienEnd = state.lastNghienEnd;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'extruderData.json'), JSON.stringify(results, null, 2));
console.log(`Parsed successfully. Produced ${results.length} day records.`);







