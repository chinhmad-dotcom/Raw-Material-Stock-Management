const fs = require('fs');

let locContent = fs.readFileSync('frontend/src/features/settings/components/LocationsTab.tsx', 'utf8');
locContent = locContent.replace(/\\`/g, '`');
locContent = locContent.replace(/\\\$/g, '$');
fs.writeFileSync('frontend/src/features/settings/components/LocationsTab.tsx', locContent);

let khoContent = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
// Check missing closing div in StockKho
// Let's run a balance check
let opens = (khoContent.match(/<div(\s|>)/g) || []).length;
let closes = (khoContent.match(/<\/div>/g) || []).length;
console.log('StockKho div balance:', opens, closes);
