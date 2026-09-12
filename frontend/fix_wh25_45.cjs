const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldLogic = /flex-1 min-w-\[35px\] \$\{[^\}]+\}/;
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^WH(2[5-9]|3[0-9]|4[0-5])$/) ? 'max-w-[90px] xl:max-w-[120px]' : 'max-w-[64px] xl:max-w-[80px]'}";

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed silo logic for WH25-WH45');
