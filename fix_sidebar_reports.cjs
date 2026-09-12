const fs = require('fs');

// 1. Modify Sidebar
let sidebar = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace("Truck, Fan }", "Truck, FileText }");
sidebar = sidebar.replace("{ name: 'Silo Fans', path: '/silo-fans', icon: <Fan className=\"h-5 w-5\" /> },", "");
sidebar = sidebar.replace(
  "{ name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className=\"h-5 w-5\" /> },",
  "{ name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className=\"h-5 w-5\" /> },\n    { name: 'Báo Cáo', path: '/reports', icon: <FileText className=\"h-5 w-5\" /> },"
);
fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', sidebar);

// 2. Modify App.tsx
let app = fs.readFileSync('frontend/src/App.tsx', 'utf8');
app = app.replace("import SiloFanPage from './pages/SiloFanPage';", "import ReportsPage from './pages/ReportsPage';");
app = app.replace('<Route path="silo-fans" element={<SiloFanPage />} />', '<Route path="reports" element={<ReportsPage />} />');
fs.writeFileSync('frontend/src/App.tsx', app);

console.log('Sidebar and App routes updated to Báo Cáo');
