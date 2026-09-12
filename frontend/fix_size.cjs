const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// Update size logic in renderSiloSVG
code = code.replace(
  "flex-1 min-w-[35px] max-w-[80px] xl:max-w-[100px]",
  "flex-1 min-w-[35px] ${siloCode.match(/^(21|22|23|24|D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[56px] xl:max-w-[70px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[48px] xl:max-w-[60px]' : 'max-w-[80px] xl:max-w-[100px]'}"
);

// Reduce gaps
code = code.replace(/gap-0.5 sm:gap-1.5 w-full/g, 'gap-0.5 w-full');
code = code.replace(/gap-3 w-full/g, 'gap-0.5 sm:gap-1 w-full');
code = code.replace(/gap-1 w-full/g, 'gap-0.5 w-full');
code = code.replace(/gap-1.5 w-full/g, 'gap-0.5 sm:gap-1 w-full');
code = code.replace(/gap-1.5 sm:gap-2/g, 'gap-0.5 sm:gap-1');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code);
console.log("Done");
