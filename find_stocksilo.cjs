const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');

const lastReturnIndex = c.lastIndexOf('return (', c.lastIndexOf('return (') - 1); 
// There are multiple returns. Let's find the main one.
const m = c.match(/export default function StockSilo\(\) \{[\s\S]*?return \(\s*<div/);
if (m) {
  const start = m.index + m[0].length - 4;
  console.log(c.substring(start, start + 600));
}
