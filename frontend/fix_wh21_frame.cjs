const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldLogic = "siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[72px] xl:max-w-[90px]'";
const newLogic = "siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[120px] xl:max-w-[150px]'";

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed silo WH21-WH24 sizes to fit frame');
