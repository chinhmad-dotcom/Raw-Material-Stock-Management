const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Revert the size logic for WH25-45
const oldLogic = /flex-1 min-w-\[35px\] \$\{[^\}]+\}/;
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[80px] xl:max-w-[100px]' : 'max-w-[64px] xl:max-w-[80px]'}";
code = code.replace(oldLogic, newLogic);

// 2. Change layout for WORKHOUSE to justify-evenly
const oldWorkhouse = `<div className="flex justify-center gap-0.5 w-full">
                  {WORKHOUSE_1.map(code => renderSiloSVG(code))}
                </div>
                <div className="flex justify-center gap-0.5 w-full">
                  {WORKHOUSE_2.map(code => renderSiloSVG(code))}
                </div>`;
const newWorkhouse = `<div className="flex justify-evenly gap-1 w-full">
                  {WORKHOUSE_1.map(code => renderSiloSVG(code))}
                </div>
                <div className="flex justify-evenly gap-1 w-full">
                  {WORKHOUSE_2.map(code => renderSiloSVG(code))}
                </div>`;
                
code = code.replace(oldWorkhouse, newWorkhouse);

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed workhouse size and distribution');
