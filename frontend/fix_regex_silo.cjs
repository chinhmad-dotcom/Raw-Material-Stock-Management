const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// The regex matches everything inside className={`... flex-1 min-w-[35px] ${...} ...`}
const newLogic = "flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[80px] xl:max-w-[100px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]' : siloCode.match(/^(WH201|WH202|WH203|WH204)$/) ? 'max-w-[56px] xl:max-w-[70px]' : 'max-w-[48px] xl:max-w-[60px]'}";

// We need to replace the exact substring. I'll use a regex to match the old logic precisely.
const pattern = /flex-1 min-w-\[35px\] \$\{[^\}]+\}/;
code = code.replace(pattern, newLogic);

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed silo logic!');
