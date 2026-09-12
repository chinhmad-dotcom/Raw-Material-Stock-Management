const fs = require('fs');
const path = require('path');

let code = fs.readFileSync('server.js', 'utf8');

// Replace EXCEL_FILE_PATH with uploads directory logic
code = code.replace(
  `const EXCEL_FILE_PATH = 'G:\\\\App\\\\StockRM\\\\STOCK RAWMATERIAL REPORT 09-08-2026.xlsm';`,
  `const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
// Helper to get all available dates
function getAvailableDates() {
  const files = fs.readdirSync(UPLOADS_DIR);
  return files
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'))
    .map(f => f.replace('.xlsx', '').replace('.xlsm', ''))
    .sort((a, b) => new Date(b) - new Date(a)); // sort descending
}
function getLatestFilePath() {
  const dates = getAvailableDates();
  if (dates.length > 0) {
    let p = path.join(UPLOADS_DIR, dates[0] + '.xlsx');
    if (!fs.existsSync(p)) p = path.join(UPLOADS_DIR, dates[0] + '.xlsm');
    return p;
  }
  // Fallback to old file if no uploads exist
  return 'G:\\\\App\\\\StockRM\\\\STOCK RAWMATERIAL REPORT 09-08-2026.xlsm';
}
function getFilePathForDate(dateStr) {
  let p = path.join(UPLOADS_DIR, dateStr + '.xlsx');
  if (!fs.existsSync(p)) p = path.join(UPLOADS_DIR, dateStr + '.xlsm');
  return fs.existsSync(p) ? p : getLatestFilePath();
}`
);

// Replace parseExcelReport(EXCEL_FILE_PATH) with getLatestFilePath() globally where it's hardcoded
code = code.replace(/parseExcelReport\(EXCEL_FILE_PATH\)/g, 'parseExcelReport(getLatestFilePath())');

// Handle the dashboard summary API to accept ?date=
code = code.replace(
  `if (path === '/api/dashboard/summary') {\n    return json(req, res, getDashboardSummary());\n  }`,
  `if (path === '/api/dashboard/summary') {
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
  
  if (path === '/api/dashboard/dates') {
    return json(req, res, getAvailableDates());
  }`
);

// Handle POST import
code = code.replace(
  `fs.copyFileSync(uploadedFile.filepath, EXCEL_FILE_PATH);`,
  `const today = new Date().toISOString().split('T')[0];
          fs.copyFileSync(uploadedFile.filepath, path.join(UPLOADS_DIR, today + '.xlsx'));`
);

fs.writeFileSync('server.js', code);
console.log('Refactor script completed');
