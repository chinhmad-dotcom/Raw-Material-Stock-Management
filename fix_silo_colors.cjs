const fs = require('fs');

let k = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Change dark empty silo background
k = k.replace(/className="text-\[#F8FAFC\] dark:text-slate-800"/g, 'className="text-[#F8FAFC] dark:text-slate-600"');

// 2. Change text shadow styling to use our new silo-text class
k = k.replace(/className="text-slate-900 dark:text-slate-100" style=\{\{ textShadow: '0px 1px 2px rgba\(255,255,255,0\.7\)' \}\}/g, 'className="text-slate-900 dark:text-slate-100 silo-text"');
k = k.replace(/className="text-slate-900 dark:text-slate-200" style=\{\{ textShadow: '0px 1px 2px rgba\(255,255,255,0\.7\)' \}\}/g, 'className="text-slate-900 dark:text-slate-200 silo-text"');

fs.writeFileSync('frontend/src/pages/stock/StockSilo.tsx', k);
console.log('Fixed StockSilo text shadows and dark mode colors');
