const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  `import { DashboardPage } from './components/dashboard/DashboardPage';`, 
  `import { DashboardPage } from './components/dashboard/DashboardPage';\nimport StockKho from './pages/stock/StockKho';\nimport StockSilo from './pages/stock/StockSilo';`
);
app = app.replace(
  `<Route path="settings" element={<SettingsPage />} />`, 
  `<Route path="settings" element={<SettingsPage />} />\n          <Route path="stock-kho" element={<StockKho />} />\n          <Route path="stock-silo" element={<StockSilo />} />`
);
fs.writeFileSync('src/App.tsx', app);

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  `import { LayoutDashboard, Boxes, Settings } from 'lucide-react';`, 
  `import { LayoutDashboard, Boxes, Settings, PackageOpen, Container } from 'lucide-react';`
);
sidebar = sidebar.replace(
  `{ name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },`, 
  `{ name: 'Stock Kho', path: '/stock-kho', icon: <PackageOpen className="h-5 w-5" /> },\n    { name: 'Stock Silo', path: '/stock-silo', icon: <Container className="h-5 w-5" /> },\n    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },`
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

console.log('Routes added');
