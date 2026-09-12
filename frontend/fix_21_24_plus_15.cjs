const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldLogic = "siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[79px] xl:max-w-[99px]'";
const newLogic = "siloCode.match(/^(21|22|23|24)$/) ? 'max-w-[91px] xl:max-w-[114px]'";

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
  console.log('Fixed silo 21-24 sizes to +15%');
} else {
  console.error("String not found!");
}
