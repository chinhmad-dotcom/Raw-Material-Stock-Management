const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');
const r = c.lastIndexOf('<div className="flex items-center justify-between');
console.log(c.substring(r, r + 500));
