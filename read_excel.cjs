const XLSX = require('./mock-api/node_modules/xlsx');

const wb = XLSX.readFile('./mock-api/uploads/2026-09-10.xlsx');
const sheet = wb.Sheets['Stock Rawmaterial'];
if (!sheet) { console.log('No Stock Rawmaterial sheet'); process.exit(0); }

const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Print columns A-P for rows 0-40 to understand structure
console.log('HEADERS (rows 0-12):');
for (let i = 0; i < 14; i++) {
  const row = data[i];
  if (row && row.length > 0) {
    console.log(`Row ${i}: [${row.slice(0, 16).join('] | [')}]`);
  }
}

console.log('\nDATA ROWS (rows 12-50):');
for (let i = 12; i < 50; i++) {
  const row = data[i];
  if (row && row.length > 0) {
    console.log(`Row ${i}: [${row.slice(0, 16).join('] | [')}]`);
  }
}
