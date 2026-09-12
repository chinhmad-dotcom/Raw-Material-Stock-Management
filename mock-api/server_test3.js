const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const PORT = 5147;
const EXCEL_FILE_PATH = 'G:\\App\\StockRM\\STOCK RAWMATERIAL REPORT 09-08-2026.xlsm';

const SETTINGS_FILE_PATH = path.join(__dirname, 'settingsData.json');
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, 'utf8'));
  } catch (e) {
    return { users: [], silos: [], materials: [], logs: [] };
  }
}
function saveSettings(data) {
  fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(data, null, 2));
}
let settingsData = loadSettings();

// ─── Excel Parser for STOCK RAWMATERIAL REPORT ────────────────────────────────

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
    let expectSubTotal = false;

    for (let i = 11; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const colA = String(row[0] || '').trim(); // STT in some formats
      const colB = String(row[1] || '').trim(); // Material Name or STT
      const colC = String(row[2] || '').trim(); // Location or Material Name
      const colE = row[4];                     // Receive date
      const colF = row[5];                     // Age (Days)
      const colH = row[7];                     // Receive (kg)
      const colI = row[8];                     // Trans. In (kg)
      const colJ = row[9];                     // Usage
      const colK = row[10];                    // Trans. Out (kg)
      const colL = row[11];                    // Balance / Stock
      const colM = row[12];                    // Actual Usage (kg/day)
      const colN = row[13];                    // Day on hand (Daily)
      const colO = row[14];                    // EST Usage (kg/day)
      const colP = row[15];                    // Day on hand (Weekly)

      // Check if row has an STT number (e.g., 1, 2, ..., 16, 17)
      const sttValueA = parseInt(colA);
      const sttValueB = parseInt(colB);
      if (!isNaN(sttValueA) && sttValueA > 0) {
        currentStt = sttValueA;
      } else if (!isNaN(sttValueB) && sttValueB > 0) {
        currentStt = sttValueB;
      }

      // Determine item group type:
      let itemGroupType = defaultGroupType;
      if (sheetName === 'Stock Rawmaterial') {
        itemGroupType = (currentStt >= 1 && currentStt <= 16) ? 'Silo' : 'Phụ gia';
      } else if (sheetName === 'Liquid') {
        itemGroupType = 'Liquid';
      } else {
        itemGroupType = 'Phụ gia';
      }

      // Bỏ qua dòng Total ảo của Liquid (vd: "Total: Fish oil" nhưng không có data Usage)
      if (sheetName === 'Liquid' && colB.startsWith('Total:')) {
          const actualUsg = typeof colM === 'number' ? colM : (parseFloat(colM) || 0);
          const estUsg = typeof colO === 'number' ? colO : (parseFloat(colO) || 0);
          // Nếu dòng này không có data Usage, và không phải là nguyên liệu cuối cùng, ta có thể bỏ qua để chờ dòng Total thật
          if (actualUsg === 0 && estUsg === 0 && String(colB).toLowerCase() === 'total: fish oil') {
              continue;
          }
      }

      // Detect Total rows
      if (colB.startsWith('Total:') || colA.startsWith('Total:') || colC.startsWith('Total:')) {
        if (expectSubTotal && currentMaterialName && materialsTotals[currentMaterialName]) {
            const actualUsageKg = typeof colM === 'number' ? colM : (parseFloat(colM) || 0);
            const estUsageKg = typeof colO === 'number' ? colO : (parseFloat(colO) || 0);
            const totalStockTons = typeof colL === 'number' ? colL / 1000 : (parseFloat(colL) || 0) / 1000;

            // Phải cộng dồn vì có trường hợp gom nhiều tên phụ gia thành một
            materialsTotals[currentMaterialName].actualUsageKg += Math.max(0, actualUsageKg);
            materialsTotals[currentMaterialName].estUsageKg += Math.max(0, estUsageKg);
            // StockTons của Total row có thể không cần cộng dồn, nhưng vì gom nhóm thì cộng dồn là chuẩn
            materialsTotals[currentMaterialName].totalStockTons += Math.max(0, totalStockTons);

            expectSubTotal = false; // Ngăn dòng Grand Total tiếp theo đè dữ liệu
        }
        continue;
      }

      // Update current material name if row defines a new material
      const cStrVal = String(colC).trim().toLowerCase();
      
      // Nếu Cột C là 'Rec.', tức là Cột B đang bị kế toán dùng để ghi Mã Bồn (thụt lề), nên Cột B lúc này không phải là Tên Nguyên Liệu.
      const isColBLocationCode = (cStrVal === 'rec.' || cStrVal === 'ngày nhập'); 
                             
      if (colB && isNaN(Number(colB)) && 
          !colB.toLowerCase().includes('total') && 
          !colB.toLowerCase().includes('stt') && 
          colB.toLowerCase() !== 'rawmaterial name' && 
          colB.toLowerCase() !== 'tên nguyên liệu' &&
          !isColBLocationCode) {
          
        let rawName = String(colB).trim();
        // Gom nhóm phụ gia: loại bỏ phần trong ngoặc, ví dụ "Fish Meal (60.18%)" -> "Fish Meal"
        if (itemGroupType === 'Phụ gia' || sheetName !== 'Stock Rawmaterial') {
           rawName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
        }
        
        currentMaterialName = rawName;
        expectSubTotal = false;
        
        if (!materialsTotals[currentMaterialName]) {
            materialsTotals[currentMaterialName] = {
               materialName: currentMaterialName,
               groupType: itemGroupType,
               totalStockTons: 0,
               totalReceiveKg: 0,
               actualUsageKg: 0,
               estUsageKg: 0,
               lastProcessedSheet: sheetName
            };
        } else {
            if (materialsTotals[currentMaterialName].lastProcessedSheet !== sheetName) {
                // Reset dữ liệu nếu nguyên liệu xuất hiện ở sheet mới để tránh bị cộng nhân đôi (copy - paste giữa các sheet)
                materialsTotals[currentMaterialName].totalStockTons = 0;
                materialsTotals[currentMaterialName].totalReceiveKg = 0;
                materialsTotals[currentMaterialName].actualUsageKg = 0;
                materialsTotals[currentMaterialName].estUsageKg = 0;
                materialsTotals[currentMaterialName].lastProcessedSheet = sheetName;
            }
            // Nếu nguyên liệu đã được tạo ở sheet trước (VD: Stock Rawmaterial -> Phụ gia)
            // Nhưng bây giờ lại xuất hiện ở sheet Liquid, ta ưu tiên đổi nhóm thành Liquid để hiển thị đúng tab
            if (itemGroupType === 'Liquid' || itemGroupType === 'Silo') {
                materialsTotals[currentMaterialName].groupType = itemGroupType;
            }
        }
      }

      // Extract location code
      let locationCode = '';
      const cStr = String(colC).trim();
      const bStr = String(colB).trim();
      
      if (cStr && cStr.toLowerCase() !== 'rec.' && !cStr.toLowerCase().includes('ngày nhập')) {
        locationCode = cStr;
      } else if (bStr && isColBLocationCode) {
        locationCode = bStr;
      }

      if (locationCode === 'LF7 (1502)') {
        locationCode = 'LF7';
      }

      // Chỉ xét nếu có dữ liệu kho/nhập xuất ở dòng này
      const hasData = (row[7] !== undefined || row[8] !== undefined || row[9] !== undefined || row[10] !== undefined || row[11] !== undefined);
      if (!locationCode || !currentMaterialName || !hasData) continue;

      if (locationCode && currentMaterialName) {
          expectSubTotal = true; // Đã thấy location chi tiết, nên cho phép nhận dòng Sub Total tiếp theo
          
          // Tính nhập (Received) từ chi tiết theo yêu cầu:
          // Receive + TransIn - TransOut
          const rcv = typeof colH === 'number' ? colH : (parseFloat(colH) || 0);
          const transIn = typeof colI === 'number' ? colI : (parseFloat(colI) || 0);
          const transOut = typeof colK === 'number' ? colK : (parseFloat(colK) || 0);
          
          let locReceive = rcv + transIn - transOut;
          
          if (materialsTotals[currentMaterialName]) {
             materialsTotals[currentMaterialName].totalReceiveKg += locReceive;
          }
      }

      const stockTons = typeof colL === 'number' ? colL / 1000 : (parseFloat(colL) || 0) / 1000;
      const usageTons = typeof colJ === 'number' ? colJ / 1000 : (parseFloat(colJ) || 0) / 1000;
      const receiveKg = typeof colI === 'number' ? colI : (parseFloat(colI) || 0);
      const receiveTons = receiveKg / 1000;

      const actualUsageKg = typeof colM === 'number' ? colM : (parseFloat(colM) || 0);
      const estUsageKg = typeof colO === 'number' ? colO : (parseFloat(colO) || 0);
      const estUsageWeekKg = estUsageKg * 7;

      const ageDays = typeof colF === 'number' ? colF : (parseInt(colF) || 0);
      const dohDay = typeof colN === 'number' ? colN : (parseFloat(colN) || 0);
      const dohWeek = typeof colP === 'number' ? colP : (parseFloat(colP) || 0);

      // Date parsing
      let receiveDateStr = '';
      let rYear = 2099;
      if (colE instanceof Date) {
        receiveDateStr = colE.toISOString().split('T')[0];
        rYear = colE.getFullYear();
      } else if (typeof colE === 'string' && colE.trim()) {
        receiveDateStr = colE.trim();
        const parts = receiveDateStr.split(/[-/]/);
        for (let p of parts) {
           if (p.length === 4) rYear = parseInt(p);
        }
      }

      // KHÔNG sử dụng Hard Filter continue để tránh mất trắng bồn trống (Silo empty).
      // Việc chọn bản ghi tốt nhất (tồn > 0, ngày mới) sẽ được xử lý ở bước Deduplicate bên dưới.

      const materialName = currentMaterialName || (locationCode ? `Material ${locationCode}` : 'Raw Material');
      const capacityTons = Math.max(stockTons * 1.3, 100);
      const fillPercent = capacityTons > 0 ? (stockTons / capacityTons) * 100 : 0;

      function isSiloCode(code) {
        if (!code) return false;
        const c = String(code).trim().toLowerCase();
        if (/^wb(0?[1-9]|1[0-2])$/.test(c)) return true; // wb1-wb12 hoặc wb01-wb12
        if (/^wh(2[1-9]|3[0-9]|4[0-5])$/.test(c)) return true; // wh21-wh45
        if (/^20[1-4]$/.test(c)) return true; // 201-204
        if (/^d30[1-6]$/.test(c)) return true; // D301-D306
        return false;
      }

      let finalGroupType = itemGroupType;
      if (itemGroupType === 'Silo' && !isSiloCode(locationCode)) {
         finalGroupType = 'Phụ gia';
      }

      let locKey = locationCode;
      if (!locKey) {
          if (finalGroupType === 'Silo') locKey = `S${currentSiloId}`;
          else if (finalGroupType === 'Liquid') locKey = `L${currentAdditiveId}`; // Chống gom chung Liquid không có location thành WH
          else locKey = 'WH';
      }

      // Tra cứu maxStorageAgeDays và dohThreshold từ config
      let configuredMaxAge = null;
      let configuredDoh = null;
      if (settingsData && settingsData.materials) {
         const matConfig = settingsData.materials.find(m => m.name.toLowerCase() === currentMaterialName.toLowerCase());
         if (matConfig) {
             if (matConfig.maxStorageAgeDays) configuredMaxAge = Number(matConfig.maxStorageAgeDays);
             if (matConfig.dohThreshold) configuredDoh = Number(matConfig.dohThreshold);
         }
      }
      const actualMaxAge = configuredMaxAge || (finalGroupType === 'Silo' ? 90 : 120);
      const actualDoh = configuredDoh || 5; // Mặc định 5 ngày nếu chưa set
      
      const isCriticalAge = ageDays > actualMaxAge;
      const isNearExpiry = ageDays > (actualMaxAge * 0.8);
      const isLowStock = dohDay > 0 && dohDay < actualDoh;
      
      const baseItem = {
          materialCode: materialName.substring(0, 6).toUpperCase().replace(/\s+/g, ''),
          materialName: materialName,
          currentStockTons: Math.round(stockTons * 10) / 10,
          dayOnHand: Math.round(dohDay * 10) / 10,
          dayOnHandWeek: Math.round(dohWeek * 10) / 10,
          usageTons: Math.round(usageTons * 10) / 10,
          receiveTons: Math.round(receiveTons * 10) / 10,
          receiveKg: Math.round(receiveKg),
          actualUsageKg: Math.round(actualUsageKg),
          estUsageKg: Math.round(estUsageKg),
          estUsageWeekKg: Math.round(estUsageWeekKg),
          ageInDays: ageDays,
          receiveDate: receiveDateStr,
          isLowStockAlert: isLowStock,
          isCriticalAgeAlert: isCriticalAge,
          isNearExpiryAlert: isNearExpiry,
          groupType: finalGroupType
      };

      if (finalGroupType === 'Silo') {
         const existingIndex = silos.findIndex(i => i.siloCode === locKey);
         const siloItem = {
             ...baseItem,
             siloId: currentSiloId++, 
             siloCode: locKey,
             siloName: `Silo ${locKey}`,
             materialId: currentSiloId * 10,
             capacityTons: Math.round(capacityTons * 10) / 10,
             fillPercent: Math.round(fillPercent * 10) / 10,
             maxStorageAgeDays: actualMaxAge,
             agePercent: Math.min(100, Math.round((ageDays / actualMaxAge) * 100))
         };

         if (existingIndex !== -1) {
             const exist = silos[existingIndex];
             // Ưu tiên dòng có Tồn > 0
             if (stockTons > 0 && exist.currentStockTons <= 0) {
                 silos[existingIndex] = { ...siloItem, siloId: exist.siloId, materialId: exist.materialId };
             } else if ((stockTons > 0 && exist.currentStockTons > 0) || (stockTons <= 0 && exist.currentStockTons <= 0)) {
                 // Ưu tiên ngày mới hơn (Dựa trên rYear và tuổi ageDays)
                 if (rYear > parseInt(exist.receiveDate?.split('-')[0] || '0') || (rYear === parseInt(exist.receiveDate?.split('-')[0] || '0') && ageDays < exist.ageInDays)) {
                     silos[existingIndex] = { ...siloItem, siloId: exist.siloId, materialId: exist.materialId };
                 }
             }
         } else {
             silos.push(siloItem);
         }
      } else {
         const isLiquid = finalGroupType === 'Liquid';
         const existingIndex = additives.findIndex(i => {
             if (isLiquid) {
                 return i.warehouseLocation === locKey && (i.groupType === 'Liquid' || i.materialName === materialName);
             } else {
                 return i.warehouseLocation === locKey && i.materialName === materialName;
             }
         });
         
         const additiveItem = {
             ...baseItem,
             materialId: currentAdditiveId++,
             warehouseLocation: locKey,
             maxStorageAgeDays: actualMaxAge,
             agePercent: Math.min(100, Math.round((ageDays / actualMaxAge) * 100))
         };

         if (existingIndex !== -1) {
             const exist = additives[existingIndex];
             if (stockTons > 0 && exist.currentStockTons <= 0) {
                 additives[existingIndex] = { ...additiveItem, materialId: exist.materialId };
             } else if ((stockTons > 0 && exist.currentStockTons > 0) || (stockTons <= 0 && exist.currentStockTons <= 0)) {
                 if (rYear > parseInt(exist.receiveDate?.split('-')[0] || '0') || (rYear === parseInt(exist.receiveDate?.split('-')[0] || '0') && ageDays < exist.ageInDays)) {
                     additives[existingIndex] = { ...additiveItem, materialId: exist.materialId };
                 }
             }
         } else {
             additives.push(additiveItem);
         }
      }

      if (isLowStock || isCriticalAge) {
        alerts.push({
          id: alertIdCounter++,
          materialName: materialName,
          alertType: isCriticalAge ? 'CriticalAge' : 'LowStock',
          severity: isCriticalAge ? 'Critical' : 'Warning',
          message: isCriticalAge 
            ? `${materialName} ở ${locationCode || 'kho'} đã tồn kho ${ageDays} ngày (vượt ngưỡng).`
            : `${materialName} ở ${locationCode || 'kho'} tồn kho thấp (DOH: ${dohDay.toFixed(1)} ngày).`,
          currentValue: isCriticalAge ? ageDays : dohDay,
          thresholdValue: isCriticalAge ? 90 : 5,
          alertDate: new Date().toISOString()
        });
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
      if (finalGroup === 'Silo') return false; // Không giữ nguyên liệu Silo ở kho
      if (finalGroup === 'Liquid' && item.groupType !== 'Liquid') return false; // Không giữ bản sao Phụ gia của nguyên liệu Liquid
      return true;
  });

  silos = silos.filter(item => {
      const finalGroup = materialsTotals[item.materialName]?.groupType;
      return finalGroup === 'Silo';
  });

  console.log(`Parsed Excel successfully: ${silos.length} silos, ${additives.length} additives, ${alerts.length} alerts.`);

  return {
    silos,
    additives,
    alerts,
    materials: Object.values(materialsTotals)
  };
}

// Initial data load from Excel file
let parsedData = parseExcelReport(EXCEL_FILE_PATH) || { silos: [], additives: [], alerts: [], materials: [] };

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

// ─── Helpers & CORS ──────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

function cors(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function json(req, res, data, status = 200) {
  cors(req, res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname.toLowerCase();
  const method = req.method;

  if (method === 'OPTIONS') {
    cors(req, res);
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`${new Date().toLocaleTimeString()} | ${method} ${req.url}`);

  if (path === '/health') {
    return json(req, res, { status: 'Healthy', timestamp: new Date().toISOString(), version: '1.1.0-excel-live' });
  }

  if (path === '/api/dashboard/summary') {
    return json(req, res, getDashboardSummary());
  }

  if ((path === '/api/silostock/import' || path === '/api/additivestock/import' || path === '/api/dashboard/import') && method === 'POST') {
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
          // Lưu đè lên file hệ thống để dùng cho lần khởi động sau
          fs.copyFileSync(uploadedFile.filepath, EXCEL_FILE_PATH);
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

  if (path === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.email === 'admin@stockrm.com' && data.password === 'admin1234') {
                return json(req, res, { 
                    token: 'mock-jwt-token-12345', 
                    user: { id: 1, name: 'Admin', email: 'admin@stockrm.com', role: 'admin' } 
                });
            } else {
                return json(req, res, { error: 'Email hoặc mật khẩu không chính xác' }, 401);
            }
        } catch (e) {
            return json(req, res, { error: 'Invalid JSON request' }, 400);
        }
    });
    return;
  }

  if (path === '/api/alerts') {
    return json(req, res, parsedData.alerts);
  }

  if (path.startsWith('/api/settings/')) {
    const resource = path.split('/')[3]; // users, silos, materials, logs

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
          return json(req, res, updatedItem);
        } catch(e) { return json(req, res, { error: 'Invalid payload' }, 400); }
      });
      return;
    }

    if (method === 'DELETE') {
      const id = path.split('/')[4];
      if (id) {
        const index = settingsData[resource].findIndex(i => i.id === id);
        if (index !== -1) {
          settingsData[resource].splice(index, 1);
          saveSettings(settingsData);
          return json(req, res, { success: true });
        }
      }
      return json(req, res, { error: 'Not found' }, 404);
    }
  }

  json(req, res, { message: `Endpoint ${method} ${req.url} not found` }, 404);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║   StockRM Live Excel Mock API Server             ║');
  console.log(`  ║   Running on http://localhost:${PORT}              ║`);
  console.log('  ║   Reading: STOCK RAWMATERIAL REPORT              ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports={parseExcelReport};