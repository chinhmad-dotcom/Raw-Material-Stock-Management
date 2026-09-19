const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const PORT = 5147;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
// Helper to get all available dates
function getAvailableDates() {
  const files = fs.readdirSync(UPLOADS_DIR);
  const uniqueDates = Array.from(new Set(
      files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'))
           .map(f => f.replace('.xlsx', '').replace('.xlsm', ''))
           .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name))
  ));
  return uniqueDates.sort((a, b) => new Date(b) - new Date(a)); // sort descending
}
function getLatestFilePath() {
  const dates = getAvailableDates();
  if (dates.length > 0) {
    let p = path.join(UPLOADS_DIR, dates[0] + '.xlsx');
    if (!fs.existsSync(p)) p = path.join(UPLOADS_DIR, dates[0] + '.xlsm');
    return p;
  }
  // Fallback to old file if no uploads exist
  return 'G:AppStockRMSTOCK RAWMATERIAL REPORT 09-08-2026.xlsm';
}
function getFilePathForDate(dateStr) {
  let p = path.join(UPLOADS_DIR, dateStr + '.xlsx');
  if (!fs.existsSync(p)) p = path.join(UPLOADS_DIR, dateStr + '.xlsm');
  return fs.existsSync(p) ? p : getLatestFilePath();
}

const SETTINGS_FILE_PATH = path.join(__dirname, 'settingsData.json');
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, 'utf8'));
  } catch (e) {
    return { users: [], silos: [], materials: [], logs: [] };
  }
}
function saveSettings(data) {
  // WARNINGS LOGIC HERE 
fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(data, null, 2));
}
let settingsData = loadSettings();

// â”€â”€â”€ Excel Parser for STOCK RAWMATERIAL REPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseExcelReport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return null;
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true, cellFormulas: false });
  let silos = [];
  let additives = [];
  let alerts = [];
  const materialsTotals = {};
  
  let currentSiloId = 1;
  let currentAdditiveId = 100;
  let alertIdCounter = 1;

  // Process sheet helper
  function processSheet(sheetName, defaultGroupType) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    let currentMaterialName = '';
    let currentStt = 0;
    let primaryMaterialName = null;

    for (let i = 11; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const colA = String(row[0] || '').trim();
      const colB = String(row[1] || '').trim();
      const colC = String(row[2] || '').trim();
      const colD = String(row[3] || '').trim();
      const colE = row[4];
      const colF = row[5];
      const colH = row[7];
      const colI = row[8];
      const colJ = row[9];
      const colK = row[10];
      const colL = row[11];
      const colM = row[12];
      const colN = row[13];
      const colO = row[14];
      const colP = row[15];

      const sttValueA = parseInt(colA);
      const sttValueB = parseInt(colB);
      if (!isNaN(sttValueA) && sttValueA > 0) {
        currentStt = sttValueA;
        primaryMaterialName = null;
      } else if (!isNaN(sttValueB) && sttValueB > 0) {
        currentStt = sttValueB;
        primaryMaterialName = null;
      }

      let itemGroupType = defaultGroupType;
      if (sheetName === 'Stock Rawmaterial') {
        itemGroupType = (currentStt >= 1 && currentStt <= 16) ? 'Silo' : 'Phụ gia';
      } else if (sheetName === 'Liquid') {
        itemGroupType = 'Liquid';
      }

      const isGrandTotalRow = colA.toLowerCase().startsWith('total');
      const isSubTotalRow = colB.toLowerCase().startsWith('total') || colC.toLowerCase().startsWith('total');


      if (primaryMaterialName === 'Broken Rice #C,#B') {
          console.log('[BR]', 'rowA:', colA, 'rowB:', colB, 'rowC:', colC, 'isGrand:', isGrandTotalRow);
      }
      if (isGrandTotalRow || isSubTotalRow) {
        const actualUsageKg = parseFloat(colM) || 0;
        const estUsageKg = parseFloat(colO) || 0;
        const totalStockTons = (parseFloat(colL) || 0) / 1000;
        const dohDay = parseFloat(colN) || 0;

        if (isGrandTotalRow && primaryMaterialName && materialsTotals[primaryMaterialName]) {
            materialsTotals[primaryMaterialName].actualUsageKg = Math.max(materialsTotals[primaryMaterialName].actualUsageKg, actualUsageKg);
            materialsTotals[primaryMaterialName].estUsageKg = Math.max(materialsTotals[primaryMaterialName].estUsageKg, estUsageKg);
            // DO NOT assign totalStockTons from Grand Total to prevent 'ghost' materials without locations from displaying
            if (!materialsTotals[primaryMaterialName].dohDay) {
                materialsTotals[primaryMaterialName].dohDay = Math.max(0, dohDay);
            }
            
            primaryMaterialName = null; // CHỐT SỔ GROUP, CHUẨN BỊ CHO GROUP TIẾP THEO
        }
        
        if (isSubTotalRow && currentMaterialName && materialsTotals[currentMaterialName]) {
            materialsTotals[currentMaterialName].actualUsageKg = Math.max(0, actualUsageKg);
            materialsTotals[currentMaterialName].estUsageKg = Math.max(0, estUsageKg);
            materialsTotals[currentMaterialName].totalStockTons = Math.max(0, totalStockTons);
            materialsTotals[currentMaterialName].dohDay = Math.max(0, dohDay);
            // Cập nhật: Net Receive = Receive (H) + (Trans.In (I) - Trans.Out (K))
            const subReceiveVal = parseFloat(colH) || 0;
            const subTransInVal = parseFloat(colI) || 0;
            const subTransOutVal = parseFloat(colK) || 0;
            
            const subReceiveKg = subReceiveVal + Math.max(0, subTransInVal - subTransOutVal);
            if (subReceiveKg > 0) {
                materialsTotals[currentMaterialName].totalReceiveKg = Math.max(
                    materialsTotals[currentMaterialName].totalReceiveKg,
                    subReceiveKg
                );
            }
        }
        continue;
      }

      const cStrVal = colC.toLowerCase();
      const isColBLocationCode = (cStrVal === 'rec.' || cStrVal === 'ngày nhập' || cStrVal === 'ngÃ y nháº­p'); 
                             
      if (colB && isNaN(Number(colB)) && 
          !colB.toLowerCase().includes('total') && 
          !colB.toLowerCase().includes('stt') && 
          colB.toLowerCase() !== 'rawmaterial name' && 
          colB.toLowerCase() !== 'tên nguyên liệu' &&
          colB.toLowerCase() !== 'tÃªn nguyÃªn liá»‡u' &&
          !isColBLocationCode) {
          
        let rawName = colB;
        rawName = rawName.replace(/\\s*\\([^)]*\\)/g, '').trim();
        
        currentMaterialName = rawName;
        if (!primaryMaterialName) {
            primaryMaterialName = currentMaterialName;
        }
        
        if (!materialsTotals[currentMaterialName]) {
            materialsTotals[currentMaterialName] = {
               materialName: currentMaterialName,
               groupType: itemGroupType,
               totalStockTons: 0,
               totalReceiveKg: 0,
               actualUsageKg: 0,
               estUsageKg: 0,
               lastProcessedSheet: sheetName,
               dohDay: 0
            };
        }
      }

      const dStrVal = (colD || '').toLowerCase().trim();
      const isLocationRow = (dStrVal === 'rec.' || dStrVal === 'ngày nhập' || dStrVal === 'ngã y nháº­p' || dStrVal === 'ngày' || dStrVal === 'ngÃ y nháº­p');
      
      if (colC && (isLocationRow || /^(wh|wb|fm|a|b|c|d|e|h|v|x|y|z|\d)/i.test(cStrVal))) {
        if (currentMaterialName && materialsTotals[currentMaterialName]) {
          // Cộng cả Receive (colH) VÀ (Trans.In (colI) - Trans.Out (colK))
          const locReceiveVal = parseFloat(colH) || 0;
          const locTransInVal = parseFloat(colI) || 0;
          const locTransOutVal = parseFloat(colK) || 0;
          const locNetReceive = locReceiveVal + (locTransInVal - locTransOutVal);
          materialsTotals[currentMaterialName].totalReceiveKg += locNetReceive;
          
          const locBalance = parseFloat(colL) || 0;
          const locDoh = parseFloat(colN) || 0;
          let receiveDateNum = null;
          if (colE && !isNaN(parseFloat(colE))) receiveDateNum = parseFloat(colE);
          
          let ageInDays = 0;
          if (colF && !isNaN(parseFloat(colF))) ageInDays = parseFloat(colF);

          const loc = {
              materialName: currentMaterialName,
              locationCode: colC.trim(),
              currentStockTons: locBalance / 1000,
              receiveDateNum: receiveDateNum,
              ageInDays: ageInDays,
              dayOnHand: locDoh
          };
          
          if (itemGroupType === 'Silo') {
             loc.siloId = `-`;
             loc.siloCode = loc.locationCode;
             loc.capacityTons = 500;
             silos.push(loc);
          } else {
             loc.materialId = `-`;
             loc.warehouseLocation = loc.locationCode;
             additives.push(loc);
          }
        }
      }
    }
  }

  processSheet('Stock Rawmaterial', 'Silo');
  processSheet('Liquid', 'Liquid');
  processSheet('Thuoc khang sinh', 'Phụ gia');
  processSheet('Thuoc thi nghiem', 'Phụ gia');

  // Lọc sạch các bản ghi bị trùng lặp do kế toán copy-paste giữa các sheet
  additives = additives.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      if (finalGroup === 'Silo' && item.groupType !== 'Silo') return false; 
      if (finalGroup === 'Liquid' && item.groupType !== 'Liquid') {
          item.groupType = 'Liquid'; 
      }
      return item.currentStockTons > 0;
  });

  silos = silos.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      return finalGroup === 'Silo' && item.currentStockTons > 0;
  });

  const FIXED_SILOS = [
    'WB01','WB02','WB03','WB04','WB05','WB06','WB07','WB08','WB09','WB10','WB11','WB12',
    'WH21','WH22','WH23','WH24','WH25','WH26','WH27','WH28','WH29','WH30',
    'WH31','WH32','WH33','WH34','WH35','WH36','WH37','WH38','WH39','WH40',
    'WH41','WH42','WH43','WH44','WH45',
    '201','202','203','204',
    'D301','D302','D303','D304','D305','D306'
  ];
  FIXED_SILOS.forEach(code => {
      if (!silos.find(s => s.siloCode === code)) {
          silos.push({
              siloId: currentSiloId++,
              siloCode: code,
              siloName: `Silo ${code}`,
              materialId: currentSiloId * 10,
              materialCode: 'EMPTY',
              materialName: 'Empty',
              currentStockTons: 0,
              capacityTons: 100,
              fillPercent: 0,
              dayOnHand: 0,
              ageInDays: 0,
              isCriticalAgeAlert: false,
              isNearExpiryAlert: false,
              isLowStockAlert: false,
              groupType: 'Silo'
          });
      }
  });

  // Pre-fill fixed Liquid Tanks
  const FIXED_LIQUIDS = ['LF1', 'LF2', 'LF6', 'LF7', 'LF8', 'LM1', 'LM2'];
  FIXED_LIQUIDS.forEach(code => {
      if (!additives.find(a => a.warehouseLocation === code && a.groupType === 'Liquid')) {
          additives.push({
              materialId: currentAdditiveId++,
              materialCode: 'EMPTY',
              materialName: 'Empty',
              warehouseLocation: code,
              currentStockTons: 0,
              capacityTons: 100,
              fillPercent: 0,
              dayOnHand: 0,
              ageInDays: 0,
              isCriticalAgeAlert: false,
              isNearExpiryAlert: false,
              isLowStockAlert: false,
              groupType: 'Liquid'
          });
      }
  });

  // Generate alerts dynamically based on settings
  const rulesMap = {};
  if (settingsData && settingsData.materials) {
      settingsData.materials.forEach(m => {
          rulesMap[m.name.toLowerCase()] = m;
      });
  }

  // Low Stock alerts (Material level based on DOH)
  Object.values(materialsTotals).forEach(mat => {
      if (mat.totalStockTons <= 0) return;
      const rule = rulesMap[mat.materialName.toLowerCase()] || { dohThreshold: 5 };
      if (mat.dohDay > 0 && mat.dohDay < (rule.dohThreshold || 5)) {
          alerts.push({
              id: `alert_${Date.now()}_${alertIdCounter++}`,
              materialName: mat.materialName,
              location: '',
              alertType: 'LowStock',
              currentValue: mat.dohDay,
              severity: 'Warning',
              message: `DOH thấp: ${mat.dohDay.toFixed(1)} ngày`
          });
          
          // Mark all locations of this material as low stock
          silos.forEach(s => {
              if (s.materialName === mat.materialName && s.currentStockTons > 0) s.isLowStockAlert = true;
          });
          additives.forEach(a => {
              if (a.materialName === mat.materialName && a.currentStockTons > 0) a.isLowStockAlert = true;
          });
      }
  });

  // Critical Age alerts (Location level)
  [...silos, ...additives].forEach(loc => {
      if (loc.currentStockTons <= 0) return;
      const rule = rulesMap[loc.materialName.toLowerCase()] || { maxStorageAgeDays: loc.groupType === 'Silo' ? 90 : 120 };
      const maxAge = rule.maxStorageAgeDays || (loc.groupType === 'Silo' ? 90 : 120);
      if (loc.ageInDays > maxAge) {
          loc.isCriticalAgeAlert = true;
          alerts.push({
              id: `alert_${Date.now()}_${alertIdCounter++}`,
              materialName: loc.materialName,
              location: loc.siloCode || loc.warehouseLocation,
              alertType: 'CriticalAge',
              currentValue: loc.ageInDays,
              severity: 'Critical',
              message: `Quá hạn lưu kho: ${loc.ageInDays} ngày`
          });
      }
  });

  console.log(`Parsed Excel successfully: ${silos.length} silos, ${additives.length} additives, ${alerts.length} alerts.`);

  const uniqueAlertsMap = new Map();
  alerts.forEach(a => {
      const key = `${a.materialName}|${a.location}|${a.alertType}`;
      if (!uniqueAlertsMap.has(key)) {
          uniqueAlertsMap.set(key, a);
      } else {
          const existing = uniqueAlertsMap.get(key);
          if (a.alertType === 'CriticalAge' && (a.currentValue || 0) > (existing.currentValue || 0)) {
              uniqueAlertsMap.set(key, a);
          } else if (a.alertType === 'LowStock' && (a.currentValue || 0) < (existing.currentValue || 0)) {
              uniqueAlertsMap.set(key, a);
          }
      }
  });
  alerts.splice(0, alerts.length, ...Array.from(uniqueAlertsMap.values()));

  // Đồng bộ maxCapacity từ cài đặt
  const siloSettings = settingsData && settingsData.silos ? settingsData.silos : [];
  silos.forEach(s => {
      const setting = siloSettings.find(set => set.siloCode === s.siloCode);
      if (setting && setting.maxCapacity) {
          s.capacityTons = setting.maxCapacity;
      }
  });
  additives.forEach(a => {
      const setting = siloSettings.find(set => set.siloCode === a.warehouseLocation);
      if (setting && setting.maxCapacity) {
          a.capacityTons = setting.maxCapacity;
      }
  });

  return {
    silos,
    additives,
    alerts,
    materials: Object.values(materialsTotals)
  };
}

// Initial data load from Excel file
function syncMaterialsToSettings(extractedMaterials) { if (!extractedMaterials || extractedMaterials.length === 0) return; let settingsUpdated = false; if (!settingsData.materials) settingsData.materials = []; extractedMaterials.forEach(mat => { const existing = settingsData.materials.find(m => m.name.toLowerCase() === mat.materialName.toLowerCase()); if (!existing) { settingsData.materials.push({ id: Date.now().toString() + Math.random().toString(36).substring(2, 7), sku: 'RM-' + mat.materialName.substring(0, 4).toUpperCase().replace(/s+/g, ''), name: mat.materialName, unit: 'Ton', density: mat.groupType === 'Liquid' ? 0.9 : 0.7, maxStorageAgeDays: mat.groupType === 'Silo' ? 90 : 120, dohThreshold: 5 }); settingsUpdated = true; } }); if (settingsUpdated) { saveSettings(settingsData); } }
let parsedData = parseExcelReport(getLatestFilePath()) || { silos: [], additives: [], alerts: [], materials: [] };
syncMaterialsToSettings(parsedData.materials);

function getDashboardSummary() {
  return {
    totalActiveSilos: parsedData.silos.length,
    totalActiveAdditives: parsedData.additives.length,
    criticalAlertCount: parsedData.alerts.filter(a => a.severity === 'Critical').length,
    warningAlertCount: parsedData.alerts.filter(a => a.severity === 'Warning').length,
    totalSiloStockTons: parsedData.silos.reduce((s, e) => s + e.currentStockTons, 0),
    totalAdditiveStockTons: parsedData.additives.reduce((s, e) => s + e.currentStockTons, 0),
    silos: parsedData.silos,
    additives: parsedData.additives,
    activeAlerts: parsedData.alerts,
    materials: parsedData.materials || [],
    generatedAt: new Date().toISOString(),
  };
}

// â”€â”€â”€ Helpers & CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALLOWED_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

function cors(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function json(req, res, data, status = 200) {
  cors(req, res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let cpQueueCredentials = null;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const reqPath = url.pathname.toLowerCase();
  const method = req.method;

  if (method === 'OPTIONS') {
    cors(req, res);
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`${new Date().toLocaleTimeString()} | ${method} ${req.url}`);

  if (reqPath === '/health') {
    return json(req, res, { status: 'Healthy', timestamp: new Date().toISOString(), version: '1.1.0-excel-live' });
  }

  if (reqPath === '/api/dashboard/summary') {
    const queryDate = url.searchParams.get('date');
    const filePath = queryDate ? getFilePathForDate(queryDate) : getLatestFilePath();
    let data = { silos: [], additives: [], alerts: [], materials: [] };
    if (fs.existsSync(filePath)) {
       data = parseExcelReport(filePath) || data;
    }
    
    return json(req, res, {
      totalActiveSilos: data.silos.length,
      totalActiveAdditives: data.additives.length,
      criticalAlertCount: data.alerts.filter(a => a.severity === 'Critical').length,
      warningAlertCount: data.alerts.filter(a => a.severity === 'Warning').length,
      totalSiloStockTons: data.silos.reduce((s, e) => s + (e.currentStockTons || 0), 0),
      totalAdditiveStockTons: data.additives.reduce((s, e) => s + (e.currentStockTons || 0), 0),
      silos: data.silos,
      additives: data.additives,
      activeAlerts: data.alerts,
      materials: data.materials || [],
      generatedAt: new Date().toISOString(),
    });
  }
  
      if (reqPath === '/api/dashboard/import-history') {
      const startParam = url.searchParams.get('start');
      const endParam = url.searchParams.get('end');
      const availableDates = getAvailableDates();
      
      let datesToProcess = availableDates;
      
      if (startParam || endParam) {
          datesToProcess = availableDates.filter(d => {
              if (startParam && d < startParam) return false;
              if (endParam && d > endParam) return false;
              return true;
          });
      }
      
      const aggregatedMaterials = {};
      
      datesToProcess.forEach(date => {
         const filePath = getFilePathForDate(date);
         if (fs.existsSync(filePath)) {
            const data = parseExcelReport(filePath);
            if (data && data.materials) {
               data.materials.forEach(mat => {
                  if (!aggregatedMaterials[mat.materialName]) {
                     aggregatedMaterials[mat.materialName] = {
                        materialName: mat.materialName,
                        groupType: mat.groupType,
                        totalReceiveKg: 0,
                          actualUsageKg: 0
                       };
                  }
                  aggregatedMaterials[mat.materialName].totalReceiveKg += (mat.totalReceiveKg || 0);
                    aggregatedMaterials[mat.materialName].actualUsageKg += (mat.actualUsageKg || 0);
               });
            }
         }
      });
      
      const result = Object.values(aggregatedMaterials).filter(m => m.totalReceiveKg > 0 || m.actualUsageKg > 0);
      return json(req, res, result);
    }
    
    if (reqPath === '/api/dashboard/dates') {
    return json(req, res, getAvailableDates());
  }

  if ((reqPath === '/api/silostock/import' || reqPath === '/api/additivestock/import' || reqPath === '/api/dashboard/import') && method === 'POST') {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm({ multiples: false });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        return json(req, res, { error: 'Error parsing form data' }, 500);
      }
      
      const file = files.file;
      if (!file) {
        return json(req, res, { error: 'No file uploaded' }, 400);
      }
      
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      
      try {
        const newData = parseExcelReport(uploadedFile.filepath);
          if (newData && (newData.silos.length > 0 || newData.additives.length > 0)) {
            parsedData = newData;
            
            // Extract date from Excel cell L7
            let reportDate = new Date().toISOString().split('T')[0];
            try {
              const wb = XLSX.readFile(uploadedFile.filepath, { cellDates: false });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const cell = ws['L7'];
              if (cell) {
                  if (cell.t === 'n') {
                      const parsed = XLSX.SSF.parse_date_code(cell.v);
                      reportDate = `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
                  } else if (cell.w || cell.v) {
                      const d = new Date(cell.w || cell.v);
                      if (!isNaN(d.getTime())) {
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          reportDate = `${y}-${m}-${day}`;
                      }
                  }
              }
            } catch(e) { console.error('Failed to extract date', e); }
            
            fs.copyFileSync(uploadedFile.filepath, path.join(UPLOADS_DIR, reportDate + '.xlsx'));
            syncMaterialsToSettings(parsedData.materials);
          }
        
        return json(req, res, {
          totalRows: parsedData.silos.length + parsedData.additives.length,
          count: parsedData.silos.length + parsedData.additives.length,
          succeededRows: parsedData.silos.length + parsedData.additives.length,
          failedRows: 0,
          errors: [],
          fileName: uploadedFile.originalFilename || 'Imported File',
          importedAt: new Date().toISOString(),
        });
      } catch (e) {
        return json(req, res, { error: e.message }, 500);
      }
    });
    return;
  }

  
    if (reqPath === '/api/register' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', () => {
          try {
              const data = JSON.parse(body);
              if (!data.email || !data.password || !data.name) {
                  return json(req, res, { error: 'Missing fields' }, 400);
              }
              
              // Add to settingsData
              const newUser = {
                id: Date.now().toString(),
                email: data.email,
                name: data.name,
                password: data.password, // For mock purposes
                role: 'pending',
                status: 'pending'
              };
              settingsData.users.push(newUser);
              saveSettings(settingsData);
              
              return json(req, res, { 
                  message: 'Registration successful. Account is pending admin approval.',
                  user: newUser
              });
          } catch (e) {
              return json(req, res, { error: 'Invalid JSON request' }, 400);
          }
      });
      return;
    }

    // Add forgot-password
    if (reqPath === '/api/forgot-password' && method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
          try {
              const data = JSON.parse(body);
              const user = settingsData.users.find(u => u.email === data.email);
              if (user) {
                  // Mark user as requesting password reset
                  user.resetRequested = true;
                  saveSettings(settingsData);
              }
              // Always return success to prevent email enumeration
              return json(req, res, { message: 'If that email is in our system, a password reset request has been sent to the admin.' });
          } catch(e) { return json(req, res, { error: 'Invalid request' }, 400); }
      });
      return;
    }
    
    // Add approve user and reset password endpoints
    if (reqPath.startsWith('/api/settings/users/') && method === 'POST') {
        const parts = reqPath.split('/');
        const id = parts[4];
        const action = parts[5];
        
        if (action === 'approve') {
            const user = settingsData.users.find(u => u.id === id);
            if (user) {
                user.status = 'Active';
                user.role = 'Operator'; // Default role
                saveSettings(settingsData);
                return json(req, res, { message: 'User approved', user });
            }
            return json(req, res, { error: 'User not found' }, 404);
        }
        
        if (action === 'reset-password') {
            const user = settingsData.users.find(u => u.id === id);
            if (user) {
                user.resetRequested = false;
                user.password = '123456'; // Default reset password
                saveSettings(settingsData);
                return json(req, res, { message: 'Password reset to 123456', user });
            }
            return json(req, res, { error: 'User not found' }, 404);
        }
    }


    if (reqPath === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            // 1. Check Admin
            if (data.email === 'admin@stockrm.com' && data.password === 'admin1234') {
                return json(req, res, { 
                    token: 'mock-jwt-token-12345', 
                    user: { id: 1, name: 'Admin', email: 'admin@stockrm.com', role: 'admin' } 
                });
            } 
            
            // 2. Check registered users
            const registeredUser = settingsData.users.find(u => u.email === data.email && u.password === data.password);
            
            if (registeredUser) {
                if (registeredUser.status === 'pending') {
                    return json(req, res, { error: 'Tài khoản của bạn đang chờ Admin duyệt.' }, 403);
                }
                if (registeredUser.status === 'Inactive') {
                    return json(req, res, { error: 'Tài khoản của bạn đã bị khóa.' }, 403);
                }
                
                return json(req, res, { 
                    token: 'mock-jwt-token-' + registeredUser.id, 
                    user: { 
                        id: registeredUser.id, 
                        name: registeredUser.name, 
                        email: registeredUser.email, 
                        role: registeredUser.role 
                    } 
                });
            }
            
            // 3. Fallback error
            return json(req, res, { error: 'Email hoặc mật khẩu không chính xác' }, 401);
            
        } catch (e) {
            return json(req, res, { error: 'Invalid JSON request' }, 400);
        }
    });
    return;
  }

  if (reqPath === '/api/alerts') {
    return json(req, res, parsedData.alerts);
  }

  if (reqPath.startsWith('/api/settings/')) {
    const resource = reqPath.split('/')[3]; // users, silos, materials, logs

    if (!['users', 'silos', 'materials', 'logs'].includes(resource)) {
      return json(req, res, { error: 'Not found' }, 404);
    }

    if (method === 'GET') {
      return json(req, res, settingsData[resource] || []);
    }

    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newItem = JSON.parse(body);
          newItem.id = Date.now().toString();
          settingsData[resource].push(newItem);
          saveSettings(settingsData);
            if (resource === 'materials' || resource === 'silos') {
              let newData = parseExcelReport(getLatestFilePath());
              if (newData) {
                parsedData = newData;
                syncMaterialsToSettings(parsedData.materials);
              }
            }
          return json(req, res, newItem, 201);
        } catch(e) { return json(req, res, { error: 'Invalid payload' }, 400); }
      });
      return;
    }

    if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updatedItem = JSON.parse(body);
          const index = settingsData[resource].findIndex(i => 
             i.id === updatedItem.id || 
             (resource === 'silos' && i.siloCode === updatedItem.siloCode)
          );
          
          if (index !== -1) {
            settingsData[resource][index] = { ...settingsData[resource][index], ...updatedItem };
          } else {
            if (!updatedItem.id) updatedItem.id = Date.now().toString();
            settingsData[resource].push(updatedItem);
          }
          saveSettings(settingsData);
            if (resource === 'materials' || resource === 'silos') {
              let newData = parseExcelReport(getLatestFilePath());
              if (newData) {
                parsedData = newData;
                syncMaterialsToSettings(parsedData.materials);
              }
            }
          return json(req, res, updatedItem);
        } catch(e) { return json(req, res, { error: 'Invalid payload' }, 400); }
      });
      return;
    }

    if (method === 'DELETE') {
      const id = reqPath.split('/')[4];
      if (id) {
        const index = settingsData[resource].findIndex(i => i.id === id);
        if (index !== -1) {
          settingsData[resource].splice(index, 1);
          saveSettings(settingsData);
            if (resource === 'materials' || resource === 'silos') {
              let newData = parseExcelReport(getLatestFilePath());
              if (newData) {
                parsedData = newData;
                syncMaterialsToSettings(parsedData.materials);
              }
            }
          return json(req, res, { success: true });
        }
      }
      return json(req, res, { error: 'Not found' }, 404);
    }
  }

  

  // --- EXTRUDER API MOCKS ---
  if (reqPath === '/api/extruder/upload' && method === 'POST') {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm({ multiples: false });
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return json(req, res, { error: 'Error parsing form data' }, 500);
      }
      
      const file = files.file;
      if (!file) return json(req, res, { error: 'No file uploaded' }, 400);
      
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      const filePath = uploadedFile.filepath;
      
      try {
        const results = [];
        let reportMonth = new Date().getMonth() + 1;
        let reportYear = new Date().getFullYear();
        
        // Try to parse month and year from filename
        const filename = uploadedFile.originalFilename || '';
        
        const matchMMYYYY = /(?:T|-|_|\s|^)(0?[1-9]|1[0-2])[-_.\/](20\d\d)/i.exec(filename);
        const matchYYYYMM = /(20\d\d)[-_.\/](0?[1-9]|1[0-2])/i.exec(filename);
        
        if (matchMMYYYY) {
          reportMonth = parseInt(matchMMYYYY[1], 10);
          reportYear = parseInt(matchMMYYYY[2], 10);
        } else if (matchYYYYMM) {
          reportYear = parseInt(matchYYYYMM[1], 10);
          reportMonth = parseInt(matchYYYYMM[2], 10);
        }
        
        const wb = XLSX.readFile(filePath, { cellDates: true });
        const { fetchEnergyForDates } = require('./energyScraper');
        
        // Helper to get day record
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
            warnings: [],
            electricity: { e1: 0, e2: 0, line: 0, hamer: 0 }
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
                        
                        if (hasStart && hasEnd) {
                            const usage = endVal - startVal;
                            if (usage > 0) {
                                if (key === 'lastCornEnd') r.electricity.e1 = (r.electricity.e1 || 0) + usage;
                                else if (key === 'lastFfsEnd') r.electricity.e2 = (r.electricity.e2 || 0) + usage;
                                else if (key === 'lastLineEnd') r.electricity.line = (r.electricity.line || 0) + usage;
                                else if (key === 'lastNghienEnd') r.electricity.hamer = (r.electricity.hamer || 0) + usage;
                            }
                        }
                        
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


          // Save to extruderData.json
        // WARNINGS LOGIC HERE 
let allData = []; try { const p = path.join(__dirname, 'extruderData.json'); if (fs.existsSync(p)) allData = JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e){} allData = allData.filter(d => !(d.year === reportYear && d.month === reportMonth)); allData.push(...results); fs.writeFileSync(path.join(__dirname, 'extruderData.json'), JSON.stringify(allData, null, 2));

        // Fetch energy for these dates asynchronously
        const uniqueDates = Array.from(new Set(results.map(r => `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.date).padStart(2, '0')}`)));
        if(uniqueDates.length > 0) {
           const { fetchEnergyRange } = require('./energyScraper');
           fetchEnergyRange(uniqueDates).catch(e => console.error('Background energy fetch error:', e));
        }

        return json(req, res, {
          success: true,
          message: 'Report uploaded successfully!',
          fileName: uploadedFile.originalFilename || 'Imported File'
        });
      } catch (e) {
        console.error("Extruder parse error:", e);
        return json(req, res, { error: 'Failed to parse Excel: ' + e.message }, 500);
      }
    });
    return;
  }

  if (reqPath === '/api/extruder/production' && method === 'GET') {
    let data = [];
    try {
        const p = path.join(__dirname, 'extruderData.json');
        if (fs.existsSync(p)) {
            data = JSON.parse(fs.readFileSync(p, 'utf8'));
        }
        
        // Merge energy data if available
        const { loadEnergyData } = require('./energyScraper');
        const energyData = loadEnergyData();
        
        let injectedMonths = new Set();
        
        data = data.map(r => {
           const monthKey = `${r.year}-${String(r.month).padStart(2, '0')}`;
           const e = energyData[monthKey];
           if (e && !injectedMonths.has(monthKey)) {
               injectedMonths.add(monthKey);
               // Map meters to new scraped fields
               r.electricity = r.electricity || {};
               // Extruder bắp E1 -> EXT1
               r.electricity.scraped_e1 = e['EXT1'] || 0;
               // Extruder nành E2 -> EXT2
               r.electricity.scraped_e2 = e['EXT2'] || 0;
               // Hammer -> HM4_EX
               r.electricity.scraped_hamer = e['HM4_EX'] || 0;
               // Line -> Line EXT(MCC25]
               r.electricity.scraped_line = e['Line EXT(MCC25]'] || 0;
           }
           return r;
        });
        
    } catch (e) {
        console.error('Error fetching extruder production:', e);
    }
    return json(req, res, data);
  }
  
  if (reqPath === '/api/extruder/sync-energy' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { month, year } = JSON.parse(body);
        let allData = [];
        const p = path.join(__dirname, 'extruderData.json');
        if (fs.existsSync(p)) allData = JSON.parse(fs.readFileSync(p, 'utf8'));
        
        const filtered = allData.filter(d => d.year === year && d.month === month);
        const uniqueDates = Array.from(new Set(filtered.map(r => `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.date).padStart(2, '0')}`)));
        
        if (uniqueDates.length > 0) {
          const { fetchEnergyRange } = require('./energyScraper');
          await fetchEnergyRange(uniqueDates);
        }
        
        return json(req, res, { success: true, count: uniqueDates.length });
      } catch (e) {
        console.error('Error syncing energy data:', e);
        return json(req, res, { error: e.message }, 500);
      }
    });
    return;
  }

// ==================== TRUCK TRACKING ROUTES ====================
const recordsPath = path.join(__dirname, 'records.json');
const reasonsPath = path.join(__dirname, 'reasons.json');

const getRecords = () => {
  if (fs.existsSync(recordsPath)) {
    return JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  }
  return [];
};

const saveRecords = (data) => {
  fs.writeFileSync(recordsPath, JSON.stringify(data, null, 2));
};

const getReasons = () => {
  if (fs.existsSync(reasonsPath)) {
    return JSON.parse(fs.readFileSync(reasonsPath, 'utf8'));
  }
  return [
    "Kẹt xe",
    "Thủ tục giấy tờ chậm",
    "Chờ bốc dỡ hàng",
    "Xe hỏng",
    "Silo đầy, chờ chuyển kho",
    "Tài xế nghỉ ngơi",
    "Thời tiết xấu"
  ];
};

if (reqPath === '/api/records' && method === 'POST') {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const records = getRecords();
      
      const timeIn = new Date(data.timeIn);
      const timeOut = new Date(data.timeOut);
      const diffMs = timeOut.getTime() - timeIn.getTime();
      const totalTimeMinutes = Math.floor(diffMs / 60000);
      
      const record = {
        id: data.id || Date.now().toString(),
        vehiclePlate: data.vehiclePlate,
        material: data.material,
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        totalTimeMinutes,
        reasonForDelay: data.reasonForDelay || null,
        createdAt: new Date().toISOString(),
        status: data.status || 'pending',
        reporterSignature: data.reporterSignature || null,
        reporterName: data.reporterName || null,
        reviewerSignature: data.reviewerSignature || null,
        reviewerName: data.reviewerName || null
      };
      
      if (data.id) {
        const idx = records.findIndex(r => r.id === data.id);
        if (idx !== -1) records[idx] = record;
        else records.push(record);
      } else {
        records.push(record);
      }
      
      saveRecords(records);
      return json(req, res, { message: 'Record saved successfully', id: record.id });
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
  return;
}

if (reqPath === '/api/records' && method === 'GET') {
  return json(req, res, getRecords());
}

if (reqPath.startsWith('/api/records/monthly-report') && method === 'GET') {
  const query = new URL(req.url, 'http://localhost').searchParams;
  const month = parseInt(query.get('month'));
  const year = parseInt(query.get('year'));
  
  const records = getRecords();
  
  const monthlyRecords = records.filter(r => {
    const d = new Date(r.timeOut);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  
  const totalTrucks = monthlyRecords.length;
  let delayedCount = 0;
  let totalTime = 0;
  
  monthlyRecords.forEach(r => {
    if (r.totalTimeMinutes > 120) delayedCount++;
    totalTime += r.totalTimeMinutes || 0;
  });
  
  const delayedTrucks = totalTrucks > 0 ? Math.round((delayedCount / totalTrucks) * 100) : 0;
  const averageTurnaroundTime = totalTrucks > 0 ? Math.round(totalTime / totalTrucks) : 0;
  
  return json(req, res, {
    month,
    year,
    totalTrucks,
    delayedTrucks,
    averageTurnaroundTime,
    records: monthlyRecords.sort((a, b) => new Date(b.timeOut) - new Date(a.timeOut))
  });
}

if (reqPath === '/api/records/reasons' && method === 'GET') {
  return json(req, res, getReasons());
}

if (reqPath.startsWith('/api/records/clear-by-month') && method === 'DELETE') {
  const query = new URL(req.url, 'http://localhost').searchParams;
  const month = parseInt(query.get('month'));
  const year = parseInt(query.get('year'));
  
  let records = getRecords();
  const initialLength = records.length;
  
  records = records.filter(r => {
    const d = new Date(r.timeOut);
    return !(d.getMonth() + 1 === month && d.getFullYear() === year);
  });
  
  saveRecords(records);
  const deletedCount = initialLength - records.length;
  return json(req, res, { message: 'Records cleared', deletedCount });
}
// ===============================================================


// ==================== SILO FANS ROUTES ====================
const fansPath = path.join(__dirname, 'fans.json');

const getFans = () => {
  if (fs.existsSync(fansPath)) {
    return JSON.parse(fs.readFileSync(fansPath, 'utf8'));
  }
  return [];
};

const saveFans = (data) => {
  fs.writeFileSync(fansPath, JSON.stringify(data, null, 2));
};

if (reqPath === '/api/fans' && method === 'GET') {
  return json(req, res, getFans().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

if (reqPath === '/api/fans' && method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const fans = getFans();
      
      const record = {
        id: Date.now().toString(),
        siloName: data.siloName,
        reason: data.reason,
        volumeTons: data.volumeTons,
        totalHoursRegulated: data.totalHoursRegulated,
        planStart: data.planStart,
        planEnd: data.planEnd,
        planTotalHours: data.planTotalHours,
        actualStart: data.actualStart || null,
        actualEnd: data.actualEnd || null,
        actualTotalHours: data.actualTotalHours || null,
        staffOpen: data.staffOpen || '',
        staffClose: data.staffClose || '',
        inspectorSilo: data.inspectorSilo || '',
        inspectorLab: data.inspectorLab || '',
        note: data.note || '',
        createdAt: new Date().toISOString()
      };
      
      fans.push(record);
      saveFans(fans);
      return json(req, res, { message: 'Thêm kế hoạch thành công', id: record.id });
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
  return;
}

if (reqPath.startsWith('/api/fans/') && method === 'PUT') {
  const id = reqPath.split('/').pop();
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const updates = JSON.parse(body);
      const fans = getFans();
      const idx = fans.findIndex(f => f.id === id);
      if (idx !== -1) {
        fans[idx] = { ...fans[idx], ...updates, updatedAt: new Date().toISOString() };
        saveFans(fans);
        return json(req, res, { message: 'Cập nhật thành công', record: fans[idx] });
      }
      return json(req, res, { error: 'Không tìm thấy record' }, 404);
    } catch (err) {
      return json(req, res, { error: err.message }, 500);
    }
  });
  return;
}

if (reqPath.startsWith('/api/fans/') && method === 'DELETE') {
  const id = reqPath.split('/').pop();
  let fans = getFans();
  const initialLen = fans.length;
  fans = fans.filter(f => f.id !== id);
  if (fans.length < initialLen) {
    saveFans(fans);
    return json(req, res, { message: 'Xóa thành công' });
  }
  return json(req, res, { error: 'Không tìm thấy record' }, 404);
}
// ================= FUMIGATION LOGS API =================
const fumigationsPath = path.join(__dirname, 'fumigations.json');

const getFumigations = () => {
  if (fs.existsSync(fumigationsPath)) {
    return JSON.parse(fs.readFileSync(fumigationsPath, 'utf8'));
  }
  return [];
};

const saveFumigations = (data) => {
  fs.writeFileSync(fumigationsPath, JSON.stringify(data, null, 2));
};

if (reqPath === '/api/fumigations' && method === 'GET') {
  return json(req, res, getFumigations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

if (reqPath === '/api/fumigations' && method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const logs = getFumigations();
      
      const record = {
        id: Date.now().toString(),
        siloCode: data.siloCode,
        materialName: data.materialName,
        weightKg: data.weightKg,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      
      logs.push(record);
      saveFumigations(logs);
      
      return json(req, res, record);
    } catch (e) {
      console.error(e);
      return json(req, res, { error: 'Invalid request' }, 400);
    }
  });
  return;
}

if (reqPath.startsWith('/api/fumigations/') && method === 'DELETE') {
  const id = reqPath.split('/').pop();
  const logs = getFumigations();
  const filtered = logs.filter(r => r.id !== id);
  
  if (filtered.length !== logs.length) {
    saveFumigations(filtered);
    return json(req, res, { success: true });
  } else {
    return json(req, res, { error: 'Not found' }, 404);
  }
}

const { scrapeQueueData } = require('./scraper');

// ==========================================================
// 8. QUEUE MONITOR SCRAPING (Live)
// ==========================================================

if (reqPath === '/api/trucks/queue-login' && method === 'POST') {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', async () => {
    try {
      const { username, password } = JSON.parse(body);
      if (!username || !password) {
        return json(req, res, { error: 'Vui lòng nhập tài khoản và mật khẩu' }, 400);
      }
      
      // Store credentials temporarily for the GET request
      cpQueueCredentials = { username, password };
      console.log(`[Queue Login] Set credentials for ${username}`);
      return json(req, res, { success: true, message: 'Đăng nhập thành công' });
    } catch (e) {
      return json(req, res, { error: 'Lỗi xử lý đăng nhập' }, 500);
    }
  });
  return;
}

if (reqPath === '/api/trucks/queue-report' && method === 'GET') {
  const today = new Date().toISOString().split('T')[0];
  const dateFrom = url.searchParams.get('from') || today;
  const dateTo = url.searchParams.get('to') || today;
  const forceSync = url.searchParams.get('sync') === 'true';

  const historyPath = path.join(__dirname, 'queue-history.json');
  let historyData = [];
  if (fs.existsSync(historyPath)) {
    try { historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8')); } catch(e){}
  }

  let scrapeRequired = false;
  let scrapeFrom = dateFrom;
  let scrapeTo = dateTo;

  if (forceSync && dateTo >= today) {
    scrapeRequired = true;
    scrapeTo = today; // CP web chỉ có data đến hôm nay
  }

  try {
    if (scrapeRequired) {
      if (!cpQueueCredentials) {
        return json(req, res, { error: 'REQUIRES_LOGIN', message: 'Yêu cầu đăng nhập vào hệ thống CP' }, 401);
      }
      
      try {
        const liveData = await scrapeQueueData(cpQueueCredentials.username, cpQueueCredentials.password, scrapeFrom, scrapeTo);
        
        // Merge liveData vào history
        liveData.forEach(item => {
          const existingIdx = historyData.findIndex(h => h.licensePlate === item.licensePlate && h.weight1 === item.weight1);
          if (existingIdx >= 0) {
            historyData[existingIdx] = { ...historyData[existingIdx], ...item };
          } else {
            historyData.push(item);
          }
        });
        fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2));
      } catch (scrapeErr) {
        console.error('[Scrape Error]', scrapeErr.message);
        cpQueueCredentials = null; // reset
        return json(req, res, { error: 'REQUIRES_LOGIN', message: scrapeErr.message || 'Đăng nhập thất bại' }, 401);
      }
    }

    // Filter historyData theo dateFrom, dateTo
    const parseDateStr = (dateStr) => { // format DD/MM/YYYY
      if (!dateStr) return null;
      const parts = dateStr.split(' ')[0].split('/');
      if (parts.length !== 3) return null;
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };
    
    // Set hours to 0 to compare purely by date
    const dFrom = new Date(dateFrom); dFrom.setHours(0,0,0,0);
    const dTo = new Date(dateTo); dTo.setHours(23,59,59,999);
    
    const result = historyData.filter(item => {
      const d = parseDateStr(item.weight1);
      if (!d) return false;
      return d >= dFrom && d <= dTo;
    });

    return json(req, res, result);
  } catch (err) {
    return json(req, res, { error: 'Lỗi máy chủ nội bộ', details: err.message }, 500);
  }
}

if (reqPath === '/api/trucks/queue-history' && method === 'GET') {
  const historyPath = path.join(__dirname, 'queue-history.json');
  let historyData = [];
  if (fs.existsSync(historyPath)) {
    try { historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8')); } catch(e){}
  }

  const dateFrom = url.searchParams.get('from');
  const dateTo = url.searchParams.get('to');
  
  if (dateFrom && dateTo) {
    const parseDateStr = (dateStr) => { 
      if (!dateStr) return null;
      const parts = dateStr.split(' ')[0].split('/');
      if (parts.length !== 3) return null;
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };
    const dFrom = new Date(dateFrom); dFrom.setHours(0,0,0,0);
    const dTo = new Date(dateTo); dTo.setHours(23,59,59,999);
    historyData = historyData.filter(item => {
      const d = parseDateStr(item.weight1);
      if (!d) return false;
      return d >= dFrom && d <= dTo;
    });
  }

  return json(req, res, historyData);
}

// ==========================================================

  json(req, res, { message: `Endpoint ${method} ${req.url} not found` }, 404);

});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
  console.log('  â•‘   StockRM Live Excel Mock API Server             â•‘');
  console.log(`  â•‘   Running on http://localhost:${PORT}              â•‘`);
  console.log('  â•‘   Reading: STOCK RAWMATERIAL REPORT              â•‘');
  console.log('  â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log('');
});









