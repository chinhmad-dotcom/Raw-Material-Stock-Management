const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Increase max-w by 15%
const oldLogic = /flex-1 min-w-\[35px\] \$\{[^\}]+\}/;
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[92px] xl:max-w-[115px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[83px] xl:max-w-[104px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[92px] xl:max-w-[115px]' : 'max-w-[74px] xl:max-w-[92px]'}";
code = code.replace(oldLogic, newLogic);

// 2. Push silos UP (remove vertical justify-center)
code = code.replace(/flex flex-col gap-0\.5 w-full h-full justify-center/g, 'flex flex-col gap-0.5 w-full h-full justify-start');
code = code.replace(/flex flex-col gap-1 items-center w-full h-full justify-center/g, 'flex flex-col gap-0.5 items-center w-full h-full justify-start');
code = code.replace(/flex flex-col gap-1 items-center w-full/g, 'flex flex-col gap-0.5 items-center w-full justify-start');

// 3. Reduce WORKHOUSE padding
code = code.replace(/rounded-xl p-2 shadow-sm w-full/g, 'rounded-xl p-0.5 shadow-sm w-full');

// 4. In renderSiloSVG wrapper, it has justify-end.
// `<div className="w-full flex-1 flex flex-col items-center justify-end">`
// Let's make it justify-start so the SVG sticks to the top of its box!
code = code.replace(/w-full flex-1 flex flex-col items-center justify-end/g, 'w-full flex-1 flex flex-col items-center justify-start');
code = code.replace(/relative flex flex-col items-center justify-end transition-transform/g, 'relative flex flex-col items-center justify-start transition-transform');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed push up and +15% width');
