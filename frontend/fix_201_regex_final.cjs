const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldLogic = "siloCode.match(/^(WH201|WH202|WH203|WH204)$/) ? 'max-w-[80px] xl:max-w-[100px]'";
const newLogic = "siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[80px] xl:max-w-[100px]'";

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed silo 201-204 regex match');
