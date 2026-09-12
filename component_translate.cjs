const fs = require('fs');

function translateFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // inject useTranslation if not present
    if (!content.includes('useTranslation')) {
        content = "import { useTranslation } from 'react-i18next';\n" + content;
    }
    const componentMatch = content.match(/export (?:default )?(?:function |const )([A-Za-z0-9_]+)[\s=]*\([^)]*\)\s*(?:=>)?\s*\{/);
    if (componentMatch && !content.includes('const { t } = useTranslation();')) {
        content = content.replace(componentMatch[0], componentMatch[0] + "\n  const { t } = useTranslation();\n");
    }
    
    // apply specific replacements
    replacements.forEach(r => {
        // Find text enclosed in > < and replace it
        // Or find specific strings
        if (r.type === 'jsx') {
            const regex = new RegExp(`>\\s*${r.text}\\s*<`, 'g');
            content = content.replace(regex, `>{t('${r.key}', '${r.text}')}<`);
        } else if (r.type === 'placeholder') {
            const regex = new RegExp(`placeholder=["']${r.text}["']`, 'g');
            content = content.replace(regex, `placeholder={t('${r.key}', '${r.text}')}`);
        } else if (r.type === 'literal') {
             const regex = new RegExp(`'${r.text}'`, 'g');
             content = content.replace(regex, `t('${r.key}', '${r.text}')`);
        }
    });

    fs.writeFileSync(filePath, content);
}

// Profile Tab
translateFile('frontend/src/features/settings/components/ProfileTab.tsx', [
    { type: 'jsx', text: 'Hồ sơ cá nhân', key: 'tabs.profile.title' },
    { type: 'jsx', text: 'Tên hiển thị', key: 'tabs.profile.displayName' },
    { type: 'jsx', text: 'Vai trò', key: 'tabs.profile.role' },
    { type: 'jsx', text: 'Chữ ký điện tử', key: 'tabs.profile.signature' },
    { type: 'jsx', text: 'Chữ ký này sẽ được tự động điền vào các file báo cáo PDF (ví dụ: Kế hoạch mở quạt). Dùng nền trong suốt (PNG) để có kết quả tốt nhất.', key: 'tabs.profile.sigDesc' },
    { type: 'jsx', text: 'Đã lưu chữ ký', key: 'tabs.profile.sigSaved' },
    { type: 'jsx', text: 'Chưa có chữ ký', key: 'tabs.profile.noSig' }
]);

// Account Tab
translateFile('frontend/src/features/settings/components/AccountTab.tsx', [
    { type: 'jsx', text: 'User Management', key: 'tabs.account.title' },
    { type: 'jsx', text: 'Add User', key: 'tabs.account.addUser' },
    { type: 'jsx', text: 'Họ Tên Đầy Đủ', key: 'tabs.account.fullName' },
    { type: 'jsx', text: 'Email', key: 'tabs.account.email' },
    { type: 'jsx', text: 'Role', key: 'tabs.account.role' },
    { type: 'jsx', text: 'Status', key: 'tabs.account.status' },
    { type: 'jsx', text: 'Actions', key: 'tabs.account.actions' },
    { type: 'jsx', text: 'Reset Requested', key: 'tabs.account.resetReq' },
    { type: 'jsx', text: 'Name', key: 'tabs.account.name' },
    { type: 'jsx', text: 'Admin', key: 'tabs.account.admin' },
    { type: 'jsx', text: 'Manager', key: 'tabs.account.manager' },
    { type: 'jsx', text: 'Operator', key: 'tabs.account.operator' },
    { type: 'jsx', text: 'Active', key: 'tabs.account.active' },
    { type: 'jsx', text: 'Pending', key: 'tabs.account.pending' },
    { type: 'jsx', text: 'Inactive', key: 'tabs.account.inactive' },
    { type: 'jsx', text: 'Cancel', key: 'tabs.account.cancel' },
    { type: 'jsx', text: 'Save', key: 'tabs.account.save' }
]);

// Silo Tab
translateFile('frontend/src/features/settings/components/SiloTab.tsx', [
    { type: 'jsx', text: 'Loc', key: 'tabs.silo.loc' },
    { type: 'jsx', text: 'Material', key: 'tabs.silo.material' },
    { type: 'jsx', text: 'Max (T)', key: 'tabs.silo.maxT' },
    { type: 'jsx', text: 'Color', key: 'tabs.silo.color' },
    { type: 'jsx', text: 'Act', key: 'tabs.silo.act' },
    { type: 'jsx', text: 'Nguyên liệu hiện tại:', key: 'tabs.silo.currMat' },
    { type: 'jsx', text: 'Max Capacity (Tons)', key: 'tabs.silo.maxCap' },
    { type: 'jsx', text: 'Silo Color', key: 'tabs.silo.siloColor' },
    { type: 'jsx', text: 'Choose Hex Color', key: 'tabs.silo.hex' },
    { type: 'jsx', text: 'Save Config', key: 'tabs.silo.save' }
]);

// Materials Tab
translateFile('frontend/src/features/settings/components/MaterialsTab.tsx', [
    { type: 'jsx', text: 'Raw Materials & Rules', key: 'tabs.mat.title' },
    { type: 'jsx', text: 'Add Material', key: 'tabs.mat.add' },
    { type: 'jsx', text: 'SKU', key: 'tabs.mat.sku' },
    { type: 'jsx', text: 'Material Name', key: 'tabs.mat.matName' },
    { type: 'jsx', text: 'Unit', key: 'tabs.mat.unit' },
    { type: 'jsx', text: 'Density (t/mÂ³)', key: 'tabs.mat.density' },
    { type: 'jsx', text: 'Ngày tuổi tiêu chuẩn', key: 'tabs.mat.stdAge' },
    { type: 'jsx', text: 'DOH cảnh báo', key: 'tabs.mat.doh' },
    { type: 'jsx', text: 'SKU Code', key: 'tabs.mat.skuCode' },
    { type: 'jsx', text: 'Color (Hiển thị trên Silo)', key: 'tabs.mat.siloColor' },
    { type: 'jsx', text: 'Max Storage Age (Days)', key: 'tabs.mat.maxAge' },
    { type: 'jsx', text: 'Min DOH (Days)', key: 'tabs.mat.minDoh' },
    { type: 'placeholder', text: 'Tìm nguyên liệu...', key: 'tabs.mat.search' }
]);

// Logs Tab
translateFile('frontend/src/features/settings/components/LogsTab.tsx', [
    { type: 'jsx', text: 'SYSTEM AUDIT & MAIL LOGS', key: 'tabs.logs.title' },
    { type: 'jsx', text: 'Live Stream', key: 'tabs.logs.live' },
    { type: 'jsx', text: '_waiting for incoming signals...', key: 'tabs.logs.waiting' }
]);

// FanPlanForm
translateFile('frontend/src/components/fans/FanPlanForm.tsx', [
    { type: 'jsx', text: 'Kế Hoạch Mở Quạt', key: 'fan.form.title' },
    { type: 'jsx', text: 'Silo', key: 'fan.form.silo' },
    { type: 'jsx', text: 'Lý do', key: 'fan.form.reason' },
    { type: 'jsx', text: 'Tấn', key: 'fan.form.tons' },
    { type: 'jsx', text: 'Giờ Quy Định', key: 'fan.form.reqHrs' },
    { type: 'jsx', text: 'Mở (K.Hoạch)', key: 'fan.form.startPlan' },
    { type: 'jsx', text: 'Tắt (K.Hoạch 8h)', key: 'fan.form.endPlan' },
    { type: 'jsx', text: 'T.Tế Mở', key: 'fan.form.actStart' },
    { type: 'jsx', text: 'T.Tế Tắt', key: 'fan.form.actEnd' },
    { type: 'jsx', text: 'T.Gian Thực(h)', key: 'fan.form.actHrs' },
    { type: 'jsx', text: 'NV Mở', key: 'fan.form.startedBy' },
    { type: 'jsx', text: 'NV Tắt', key: 'fan.form.endedBy' },
    { type: 'jsx', text: 'KT Silo', key: 'fan.form.qcSilo' },
    { type: 'jsx', text: 'KT Lab', key: 'fan.form.qcLab' },
    { type: 'jsx', text: 'Ghi chú', key: 'fan.form.notes' }
]);

// FanPlanList
translateFile('frontend/src/components/fans/FanPlanList.tsx', [
    { type: 'jsx', text: 'Danh sách & Báo cáo', key: 'fan.list.title' },
    { type: 'jsx', text: 'Xem Trước', key: 'fan.list.preview' },
    { type: 'jsx', text: 'Tải PDF', key: 'fan.list.pdf' },
    { type: 'jsx', text: 'Silo', key: 'fan.form.silo' },
    { type: 'jsx', text: 'Lý do', key: 'fan.form.reason' },
    { type: 'jsx', text: 'Tấn', key: 'fan.form.tons' },
    { type: 'jsx', text: 'H (QĐ)', key: 'fan.list.reqH' },
    { type: 'jsx', text: 'Kế Hoạch', key: 'fan.list.plan' },
    { type: 'jsx', text: 'Thực Tế', key: 'fan.list.actual' },
    { type: 'jsx', text: 'TT', key: 'fan.list.st' },
    { type: 'jsx', text: 'T.Tác', key: 'fan.list.act' },
    { type: 'jsx', text: 'Mở', key: 'fan.list.on' },
    { type: 'jsx', text: 'Tắt', key: 'fan.list.off' },
    { type: 'jsx', text: 'H', key: 'fan.list.h' },
    { type: 'jsx', text: 'Đang tải...', key: 'fan.list.loading' },
    { type: 'jsx', text: 'Chưa có dữ liệu cho năm và bồn này', key: 'fan.list.nodata' },
    { type: 'jsx', text: 'Đã duyệt', key: 'fan.list.approved' },
    { type: 'jsx', text: 'Chờ duyệt', key: 'fan.list.pending' },
    { type: 'jsx', text: 'Tải xuống', key: 'fan.list.download' }
]);

console.log('Processed component translation scripts');
