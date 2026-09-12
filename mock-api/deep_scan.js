const XLSX = require('xlsx');

const filePath = 'G:\\App\\StockRM\\STOCK RAWMATERIAL REPORT 09-08-2026.xlsm';
const workbook = XLSX.readFile(filePath, { cellDates: true });

function inspectSheet(sheetName, maxRows = 60) {
  console.log(`\n========================================`);
  console.log(`DETAILS FOR SHEET: ${sheetName}`);
  console.log(`========================================`);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.log('Sheet not found!');
    return;
  }
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  for (let i = 0; i < Math.min(data.length, maxRows); i++) {
    const row = data[i];
    if (row.some(cell => cell !== '')) {
      const formatted = row.map(c => {
        if (c instanceof Date) return c.toISOString().split('T')[0];
        if (typeof c === 'number') return Math.round(c * 100) / 100;
        return String(c).replace(/[\r\n]+/g, ' ');
      });
      console.log(`[R${i + 1}]`, formatted.filter(c => c !== '').slice(0, 20).join(' | '));
    }
  }
}

inspectSheet('Stock Rawmaterial', 65);
inspectSheet('Liquid', 40);
