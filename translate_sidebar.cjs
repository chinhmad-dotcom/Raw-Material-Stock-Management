const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');

if (!code.includes('useTranslation')) {
  code = code.replace(
    "import { useLocation, Link } from 'react-router-dom';",
    "import { useLocation, Link } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
  );

  code = code.replace(
    "export function Sidebar() {",
    "export function Sidebar() {\n  const { t } = useTranslation();"
  );

  // Replace text in the array definition or rendered text.
  // Sidebar probably defines items array. Let's find it.
  code = code.replace(
    /name: 'Tổng quan'/g,
    "name: t('sidebar.dashboard', 'Tổng quan')"
  );
  code = code.replace(
    /name: 'Quản lý xe hàng'/g,
    "name: t('sidebar.truckTracking', 'Quản lý xe hàng')"
  );
  code = code.replace(
    /name: 'Ghi điện kế'/g,
    "name: t('sidebar.powerMeters', 'Ghi điện kế')"
  );
  code = code.replace(
    /name: 'Báo Cáo'/g,
    "name: t('sidebar.reports', 'Báo Cáo')"
  );
  code = code.replace(
    /name: 'Cài đặt'/g,
    "name: t('sidebar.settings', 'Cài đặt')"
  );

  fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', code);
  console.log('Sidebar translated');
}
