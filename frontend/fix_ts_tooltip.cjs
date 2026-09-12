const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

code = code.replace(/silo\.batchNumber/g, '(silo as any).batchNumber');
code = code.replace(/silo\.isCriticalAgeAlert/g, '(silo as any).isCriticalAgeAlert');
code = code.replace(/silo\.ageInDays/g, '(silo as any).ageInDays');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed TS errors in tooltip');
