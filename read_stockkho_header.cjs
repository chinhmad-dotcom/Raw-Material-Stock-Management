const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
const start = c.indexOf('<div className="flex items-center justify-between rounded-2xl');
console.log(c.substring(start, start + 600));
