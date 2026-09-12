const fs = require('fs');

let code = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');

// Filter > 0
code = code.replace(
  `const getAdditivesAt = (loc: string) => additives.filter(a => a.warehouseLocation === loc);`,
  `const getAdditivesAt = (loc: string) => additives.filter(a => a.warehouseLocation === loc && a.currentStockTons > 0);`
);

code = code.replace(
  `.filter(a => !ZONES.some(z => z.locations.includes(a.warehouseLocation || '')))`,
  `.filter(a => !ZONES.some(z => z.locations.includes(a.warehouseLocation || '')) && a.currentStockTons > 0)`
);

// Replace unit to kg
code = code.replace(
  /\{item\.currentStockTons\.toFixed\(0\)\} T/g,
  `{(item.currentStockTons * 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`
);

fs.writeFileSync('src/pages/stock/StockKho.tsx', code);
console.log('Fixed StockKho unit and 0-stock filtering');
