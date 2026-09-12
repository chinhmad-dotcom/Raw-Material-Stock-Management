const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/ReportsPage.tsx', 'utf8');
if (!c.includes('useTranslation')) {
    c = c.replace("export default function ReportsPage() {", "import { useTranslation } from 'react-i18next';\n\nexport default function ReportsPage() {\n  const { t } = useTranslation();");
}
c = c.replace(/>Hệ Thống Báo Cáo</g, ">{t('pages.reports.title', 'Hệ Thống Báo Cáo')}<");
c = c.replace(/> Báo cáo mở quạt</g, "> {t('pages.reports.fanReport', 'Báo cáo mở quạt')}<");
fs.writeFileSync('frontend/src/pages/ReportsPage.tsx', c);

let s = fs.readFileSync('frontend/src/pages/SettingsPage.tsx', 'utf8');
if (!s.includes('useTranslation')) {
    s = s.replace("export function SettingsPage() {", "import { useTranslation } from 'react-i18next';\n\nexport function SettingsPage() {\n  const { t } = useTranslation();");
}
s = s.replace(/>System Settings</g, ">{t('pages.settings.title', 'System Settings')}<");
s = s.replace(/>Manage system configuration, users, and audit logs</g, ">{t('pages.settings.subtitle', 'Manage system configuration, users, and audit logs')}<");
s = s.replace(/label: 'My Profile'/g, "label: t('pages.settings.tabs.profile', 'My Profile')");
s = s.replace(/label: 'Account Management'/g, "label: t('pages.settings.tabs.accounts', 'Account Management')");
s = s.replace(/label: 'Location parameters'/g, "label: t('pages.settings.tabs.silos', 'Location parameters')");
s = s.replace(/label: 'Raw Materials & Rules'/g, "label: t('pages.settings.tabs.materials', 'Raw Materials & Rules')");
s = s.replace(/label: 'Audit & Mail Logs'/g, "label: t('pages.settings.tabs.logs', 'Audit & Mail Logs')");
fs.writeFileSync('frontend/src/pages/SettingsPage.tsx', s);

let k = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
if (!k.includes('useTranslation')) {
    k = k.replace("export default function StockKho() {", "import { useTranslation } from 'react-i18next';\n\nexport default function StockKho() {\n  const { t } = useTranslation();");
}
k = k.replace(/>Sơ Đồ Kho</g, ">{t('pages.stockKho.title', 'Sơ Đồ Kho')}<");
k = k.replace(/>Trống</g, ">{t('pages.stockKho.empty', 'Trống')}<");
k = k.replace(/>CÁC VỊ TRÍ KHÁC</g, ">{t('pages.stockKho.otherLocations', 'CÁC VỊ TRÍ KHÁC')}<");

fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', k);

console.log('Fixed pages');
