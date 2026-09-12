const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Silo hiá»‡n táº¡i/g, 'Silo hiện tại');
  content = content.replace(/Há»§y/g, 'Hủy');
  content = content.replace(/Phá»¥ gia/g, 'Phụ gia');
  fs.writeFileSync(file, content, 'utf8');
}

fixFile('src/pages/stock/StockSilo.tsx');
fixFile('src/features/settings/components/SiloTab.tsx');
console.log('Fixed font encoding issues');
