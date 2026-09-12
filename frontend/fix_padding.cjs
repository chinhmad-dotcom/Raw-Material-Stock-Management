const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Update Sizes (+10%)
const oldLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : 'max-w-[56px] xl:max-w-[70px]'}";
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[88px] xl:max-w-[110px]' : siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[79px] xl:max-w-[99px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[62px] xl:max-w-[77px]' : 'max-w-[56px] xl:max-w-[70px]'}";

code = code.replace(oldLogic, newLogic);

// 2. Reduce padding in containers
code = code.replace(/p-1\.5 shadow-sm/g, 'p-0.5 shadow-sm');
code = code.replace(/p-1 sm:p-2/g, 'p-0.5 sm:p-1');
code = code.replace(/gap-0\.5 sm:gap-1/g, 'gap-0.5');
code = code.replace(/mb-1 sm:mb-2/g, 'mb-0.5 sm:mb-1');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed padding and sizes');
