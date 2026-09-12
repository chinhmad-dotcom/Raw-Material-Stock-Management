const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');

// Replace the outer grid
code = code.replace(
  'className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"',
  'className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-1.5"'
);

// Replace the inner container for items
code = code.replace(
  '<div className="flex flex-col gap-0">',
  '<div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-x-2 gap-y-1">'
);

fs.writeFileSync('src/pages/stock/StockKho.tsx', code);
console.log('Done replacing layout classes.');
