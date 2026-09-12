const fs = require('fs');

let appCode = fs.readFileSync('frontend/src/App.tsx', 'utf8');
const truckImport = "import TruckTrackingPage from './pages/TruckTrackingPage';\n";
appCode = appCode.replace("import ExtruderPage from './pages/ExtruderPage';", "import ExtruderPage from './pages/ExtruderPage';\n" + truckImport);

const truckRoute = '          <Route path="extruder" element={<ExtruderPage />} />\n          <Route path="truck-tracking" element={<TruckTrackingPage />} />';
appCode = appCode.replace('<Route path="extruder" element={<ExtruderPage />} />', truckRoute);

fs.writeFileSync('frontend/src/App.tsx', appCode);

let sidebarCode = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');
const truckIconImport = "import { LayoutDashboard, Boxes, Settings, PackageOpen, Container, Factory, Truck } from 'lucide-react';";
sidebarCode = sidebarCode.replace("import { LayoutDashboard, Boxes, Settings, PackageOpen, Container, Factory } from 'lucide-react';", truckIconImport);

const truckNav = "    { name: 'Extruder', path: '/extruder', icon: <Factory className=\"h-5 w-5\" /> },\n    { name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className=\"h-5 w-5\" /> },";
sidebarCode = sidebarCode.replace("{ name: 'Extruder', path: '/extruder', icon: <Factory className=\"h-5 w-5\" /> },", truckNav);

fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', sidebarCode);

console.log('Patched App.tsx and Sidebar.tsx');
