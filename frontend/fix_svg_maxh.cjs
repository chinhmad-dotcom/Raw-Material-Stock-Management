const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

const oldSvg = '<svg viewBox="0 0 100 150" className="w-full h-auto drop-shadow-md overflow-visible" preserveAspectRatio="xMidYMax meet">';
const newSvg = '<svg viewBox="0 0 100 150" className="w-full h-auto max-h-[15vh] xl:max-h-[18vh] 2xl:max-h-[20vh] drop-shadow-md overflow-visible" preserveAspectRatio="xMidYMax meet">';

code = code.replace(oldSvg, newSvg);

// I should also ensure that the max-widths aren't so massive that they overlap horizontally if they hit their max-h.
// They won't overlap because `w-full` limits them horizontally, and flex distribution prevents overlapping.
fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Fixed SVG max height');
