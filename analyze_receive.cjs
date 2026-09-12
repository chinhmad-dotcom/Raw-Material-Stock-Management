const XLSX = require('./mock-api/node_modules/xlsx');

const wb = XLSX.readFile('./mock-api/uploads/2026-09-10.xlsx');
const sheet = wb.Sheets['Stock Rawmaterial'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Tìm nguyên liệu có colH > 0 hay colI > 0
console.log('Rows with colH or colI data:');
for (let i = 11; i < 120; i++) {
  const row = data[i];
  if (!row) continue;
  const colH = parseFloat(row[7]) || 0;
  const colI = parseFloat(row[8]) || 0;
  if (colH > 0 || colI > 0) {
    console.log(`Row ${i}: B=${row[1]}, C=${row[2]}, H(Receive)=${colH}, I(Trans.In)=${colI}`);
  }
}
