const fs = require('fs');
const lines = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('hiá') || l.includes('Há»') || l.includes('cÃ') || l.includes('Ã')) {
    console.log(i, l);
  }
});
