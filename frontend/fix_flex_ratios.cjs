const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// Replace WETBINS flex
code = code.replace(/xl:flex-\[4\](.*?)1\. WETBINS/s, 'xl:flex-[30]$11. WETBINS');
// Replace GRAIN SILO flex
code = code.replace(/xl:flex-\[4\](.*?)2\. GRAIN SILO/s, 'xl:flex-[55]$12. GRAIN SILO');
// Replace MEAL SILO flex
code = code.replace(/xl:flex-\[2\](.*?)3\. MEAL SILO/s, 'xl:flex-[15]$13. MEAL SILO');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed layout flex ratios');
