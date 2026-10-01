const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.tsx', 'utf8');

const importsToRemove = [
  "import { DashboardPage } from './components/dashboard/DashboardPage';",
  "import StockKho from './pages/stock/StockKho';",
  "import StockSilo from './pages/stock/StockSilo';",
  "import { SettingsPage } from './pages/SettingsPage';",
  "import ExtruderPage from './pages/ExtruderPage';",
  "import TruckTrackingPage from './pages/TruckTrackingPage';",
  "import FanReportPage from './pages/FanReportPage';",
  "import FumigationReportPage from './pages/FumigationReportPage';",
  "import ElectricityCostReport from './pages/ElectricityCostReport';",
  "import KpiDashboard from './pages/KpiDashboard';"
];

for (const imp of importsToRemove) {
  c = c.replace(imp + '\n', '');
}

const lazyImports = `
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StockKho = lazy(() => import('./pages/stock/StockKho'));
const StockSilo = lazy(() => import('./pages/stock/StockSilo'));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ExtruderPage = lazy(() => import('./pages/ExtruderPage'));
const TruckTrackingPage = lazy(() => import('./pages/TruckTrackingPage'));
const FanReportPage = lazy(() => import('./pages/FanReportPage'));
const FumigationReportPage = lazy(() => import('./pages/FumigationReportPage'));
const ElectricityCostReport = lazy(() => import('./pages/ElectricityCostReport'));
const KpiDashboard = lazy(() => import('./pages/KpiDashboard'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
  </div>
);
`;

c = c.replace("import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';", 
  "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';" + lazyImports);

c = c.replace("<MainLayout />", `<MainLayout />`); // keep as is
c = c.replace(
  /<Route index element=\{<DashboardPage \/>\} \/>/g, 
  `<Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />`
);
c = c.replace(
  /<Route path="([^"]+)" element=\{<([A-Za-z]+) \/>\} \/>/g,
  (match, path, comp) => {
    return `<Route path="${path}" element={<Suspense fallback={<PageLoader />}><${comp} /></Suspense>} />`;
  }
);
// Make sure Navigate doesn't get Suspense if it was matched (though regex doesn't match `<Navigate`)
// Navigate is matched like `<Route path="reports" element={<Navigate ... />}` which won't match my regex.

fs.writeFileSync('frontend/src/App.tsx', c);
console.log('App.tsx lazy loading configured.');
