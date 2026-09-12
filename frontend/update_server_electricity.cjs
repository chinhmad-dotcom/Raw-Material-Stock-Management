const fs = require('fs');

let code = fs.readFileSync('../mock-api/server.js', 'utf8');

// 1. Update getDayRecord to include electricity
const oldGetDayRecord = `            oee: { average: 0, target: 0 },
            losses: [],
            warnings: []
        };`;
const newGetDayRecord = `            oee: { average: 0, target: 0 },
            losses: [],
            warnings: [],
            electricity: { e1: 0, e2: 0, line: 0, hamer: 0 }
        };`;
code = code.replace(oldGetDayRecord, newGetDayRecord);

// 2. Update checkMachine to save to r.electricity
const oldCheckMachine = `                        if (hasStart) {
                            if (stateObj[key] !== null && Math.abs(startVal - stateObj[key]) > 0.01) {
                                r.warnings.push({`;

const newCheckMachine = `                        if (hasEnd) {
                            if (key === 'lastCornEnd') r.electricity.e1 = endVal;
                            else if (key === 'lastFfsEnd') r.electricity.e2 = endVal;
                            else if (key === 'lastLineEnd') r.electricity.line = endVal;
                            else if (key === 'lastNghienEnd') r.electricity.hamer = endVal;
                        } else if (hasStart) {
                            if (key === 'lastCornEnd') r.electricity.e1 = startVal;
                            else if (key === 'lastFfsEnd') r.electricity.e2 = startVal;
                            else if (key === 'lastLineEnd') r.electricity.line = startVal;
                            else if (key === 'lastNghienEnd') r.electricity.hamer = startVal;
                        }
                        
                        if (hasStart) {
                            if (stateObj[key] !== null && Math.abs(startVal - stateObj[key]) > 0.01) {
                                r.warnings.push({`;
code = code.replace(oldCheckMachine, newCheckMachine);

fs.writeFileSync('../mock-api/server.js', code);
console.log('Updated server.js to parse and save electricity meter readings!');
