const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');

const target1 = '      {/* Bảng Chi Tiết Báo Cáo Tồn Kho từ Excel */}';
const target2 = '      {loading && (';

const idx1 = code.indexOf(target1);
const idx2 = code.indexOf(target2);

if (idx1 !== -1 && idx2 !== -1) {
  code = code.substring(0, idx1) + code.substring(idx2);
  fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', code, 'utf8');
  console.log('Removed detail report successfully');
} else {
  console.log('Targets not found', idx1, idx2);
}
