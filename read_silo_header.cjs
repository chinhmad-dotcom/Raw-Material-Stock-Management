const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');
const m = c.match(/<div className="flex flex-wrap items-center justify-between[\s\S]*?UserMenu \/>\s*<\/div>/);
console.log(m ? m[0] : 'not found');
