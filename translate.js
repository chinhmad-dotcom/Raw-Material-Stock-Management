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
    'T?t c?': 'All',
    'Ph? gia': 'Additives',
    'Ðang d?c Excel...': 'Reading Excel...',
    'Chi ti?t nguyên li?u': 'RAW MATERIAL DETAILS',
    'Nguyên Li?u': 'Material',
    'Kh?i lu?ng': 'Amount',
    'Không tìm th?y Ph? gia nào phù h?p b? l?c.': 'No additives match the selected filter.',
    'Top 10 Nguyên Li?u S? D?ng Nhi?u Nh?t': 'TOP 10 MOST USED MATERIALS',
    'S? d?ng (t)': 'Usage (t)',
    'S? d?ng': 'Usage',
    'Báo Cáo T?n Kho Chi Ti?t (STOCK RAWMATERIAL REPORT)': 'DETAILED STOCK REPORT',
    'T?ng c?ng:': 'Total records:',
    'dòng d? li?u': 'rows',
    'Location (V? trí)': 'Location',
    'Tên Nguyên Li?u': 'Material Name',
    'Ngày Nh?p': 'Received Day',
    'Ngày Tu?i': 'Age (Days)',
    'S? D?ng (t?n)': 'Usage (Tons)',
    'T?n B?n (t?n)': 'Stock (Tons)',
    'Tr?ng Thái': 'Status',
    'T?i lên thành công!\\nÐã load xong': 'Upload successful!\\nLoaded',
    'L?i file không dúng: ': 'Invalid file format: '
};

const alertsReplacements = {
    'C?nh Báo': 'ALERTS',
    'Không có c?nh báo nào vu?t ngu?ng nguy hi?m.': 'No critical alerts found.',
    'Quá tu?i:': 'Over age:',
    'DOH th?p:': 'Low DOH:'
};

replaceAll('frontend/src/components/dashboard/DashboardPage.tsx', dashboardReplacements);
replaceAll('frontend/src/components/dashboard/AlertsPanel.tsx', alertsReplacements);

console.log('Translated successfully!');
