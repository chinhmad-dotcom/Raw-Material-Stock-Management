const fs = require('fs');

let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[64px] xl:max-w-[80px]' : 'max-w-[56px] xl:max-w-[70px]'}";
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : 'max-w-[56px] xl:max-w-[70px]'}";

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed silo 21-24 sizes to 90%');
