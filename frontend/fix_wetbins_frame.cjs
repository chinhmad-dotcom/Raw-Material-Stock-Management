const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Rebalance Flex Ratios to remove empty space in GRAIN SILO
code = code.replace(/xl:flex-\[30\]/g, 'xl:flex-[37]');
code = code.replace(/xl:flex-\[55\]/g, 'xl:flex-[47]');
code = code.replace(/xl:flex-\[15\]/g, 'xl:flex-[16]');

// 2. Increase WETBINS size to fit the frame
const oldLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[80px] xl:max-w-[100px]' : 'max-w-[48px] xl:max-w-[60px]'}";
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[80px] xl:max-w-[100px]' : 'max-w-[64px] xl:max-w-[80px]'}";

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed ratios and sizes');
