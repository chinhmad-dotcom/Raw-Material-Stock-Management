const fs = require('fs');

let silo = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// Add clipPath to defs
silo = silo.replace(
  '            <defs>',
  '            <defs>\n              <clipPath id={`clip-${siloCode}`}><path d={siloPath} /></clipPath>'
);

// Replace fillPath logic with a rect that uses clipPath
silo = silo.replace(
  '<path d={fillPath} fill={`url(#grad-${siloCode})`} strokeLinejoin="round" />',
  '<rect x="0" y={Math.max(25, fillY)} width="100" height="150" fill={`url(#grad-${siloCode})`} clipPath={`url(#clip-${siloCode})`} />'
);

fs.writeFileSync('src/pages/stock/StockSilo.tsx', silo, 'utf8');
console.log('Fixed SVG clipPath');
