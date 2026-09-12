const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/ExtruderPage.tsx', 'utf8');
c = c.replace('<div className="flex-1 hidden md:block"></div>', '<div className="flex-1 hidden md:flex justify-end"><UserMenu /></div>');
fs.writeFileSync('frontend/src/pages/ExtruderPage.tsx', c);

console.log('Fixed ExtruderPage');
