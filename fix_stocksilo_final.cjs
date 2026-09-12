const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');

c = c.replace(/<div className="flex flex-wrap items-center justify-between.*?>([\s\S]*?)<\/div>/i, (match, inner) => {
   // Inject at the end of this div if not present
   if (!inner.includes('<UserMenu')) {
       return match.replace(/<\/div>$/, '  <UserMenu />\n      </div>');
   }
   return match;
});

fs.writeFileSync('frontend/src/pages/stock/StockSilo.tsx', c);
console.log('Fixed StockSilo');
