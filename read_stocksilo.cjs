const fs = require('fs');
const c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');
const lastReturnIndex = c.lastIndexOf('return (');
console.log(c.substring(lastReturnIndex, lastReturnIndex + 1000));
