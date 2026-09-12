const fs = require('fs');

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content);
}

const dashboardReplacements = {
    'Ngày báo cáo': 'REPORT DATE',
    'Nhom_Nguyen_Lieu': 'MATERIAL GROUP',
    'Ten_Nguyen_Lieu': 'MATERIAL NAME',
    'Tất cả': 'All',
    'Phụ gia': 'Additives',
    'Đang đọc Excel...': 'Reading Excel...',
    'Chi tiết nguyên liệu': 'RAW MATERIAL DETAILS',
    'Nguyên Liệu': 'Material',
    'Khối lượng': 'Amount',
    'Không tìm thấy Phụ gia nào phù hợp bộ lọc.': 'No additives match the selected filter.',
    'Top 10 Nguyên Liệu Sử Dụng Nhiều Nhất': 'TOP 10 MOST USED MATERIALS',
    'Sử dụng (t)': 'Usage (t)',
    'Sử dụng': 'Usage',
    'Báo Cáo Tồn Kho Chi Tiết (STOCK RAWMATERIAL REPORT)': 'DETAILED STOCK REPORT',
    'Tổng cộng:': 'Total records:',
    'dòng dữ liệu': 'rows',
    'Location (Vị trí)': 'Location',
    'Tên Nguyên Liệu': 'Material Name',
    'Ngày Nhập': 'Received Day',
    'Ngày Tuổi': 'Age (Days)',
    'Sử Dụng (tấn)': 'Usage (Tons)',
    'Tồn Bồn (tấn)': 'Stock (Tons)',
    'Trạng Thái': 'Status',
    'Tải lên thành công!\\nĐã load xong': 'Upload successful!\\nLoaded',
    'Lỗi file không đúng: ': 'Invalid file format: '
};

const alertsReplacements = {
    'Cảnh Báo': 'ALERTS',
    'Không có cảnh báo nào vượt ngưỡng nguy hiểm.': 'No critical alerts found.',
    'Quá tuổi:': 'Over age:',
    'DOH thấp:': 'Low DOH:'
};

replaceAll('frontend/src/components/dashboard/DashboardPage.tsx', dashboardReplacements);
replaceAll('frontend/src/components/dashboard/AlertsPanel.tsx', alertsReplacements);
console.log('Translated part 2');
