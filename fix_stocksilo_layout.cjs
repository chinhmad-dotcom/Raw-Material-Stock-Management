const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');

c = c.replace(/<UserMenu \/>\s*<\/div>\s*<\/div>/, '</div>\n        <UserMenu />\n      </div>');

fs.writeFileSync('frontend/src/pages/stock/StockSilo.tsx', c);
console.log('Fixed StockSilo Layout');
