const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'G:\\App\\StockRM\\STOCK RAWMATERIAL REPORT 09-08-2026.xlsm';

console.log('Reading file:', filePath);
const workbook = XLSX.readFile(filePath, { cellDates: true, cellFormulas: true });

console.log('\nSheet Names in File:');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n========================================`);
  console.log(`SHEET: ${sheetName}`);
  console.log(`========================================`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log(`Total rows in sheet '${sheetName}': ${data.length}`);
  
  // Show first 20 non-empty rows
  let count = 0;
  for (let i = 0; i < data.length && count < 25; i++) {
    const row = data[i];
    if (row.some(cell => cell !== '')) {
      console.log(`Row ${i + 1}:`, row.slice(0, 15));
      count++;
    }
  }
});
