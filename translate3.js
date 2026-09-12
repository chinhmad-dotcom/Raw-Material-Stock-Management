const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/dashboard/DashboardPage.tsx', 'utf8');

content = content.replace('Không tìm thấy Additives nào phù hợp bộ lọc.', 'No additives match the selected filter.');
content = content.replace('Top 10 Material Sử Dụng Nhiều Nhất', 'TOP 10 MOST USED MATERIALS');
content = content.replace('Tên Material', 'Material Name');
content = content.replace('DOH (Ngày)', 'DOH (Days)');
content = content.replace('DOH (Tuần)', 'DOH (Weeks)');
content = content.replace('Báo Cáo Tồn Kho Chi Tiết (STOCK RAWMATERIAL REPORT)', 'DETAILED STOCK REPORT');

fs.writeFileSync('frontend/src/components/dashboard/DashboardPage.tsx', content);
console.log('Fixed leftovers');
