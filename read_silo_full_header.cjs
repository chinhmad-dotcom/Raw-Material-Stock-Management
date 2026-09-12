const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');
const start = c.indexOf('<div className="flex flex-wrap items-center justify-between');
console.log(c.substring(start, start + 1500));
