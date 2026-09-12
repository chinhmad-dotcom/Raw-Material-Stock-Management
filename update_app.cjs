const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

if (!code.includes('import SiloFanPage')) {
  code = code.replace(
    "import TruckTrackingPage from './pages/TruckTrackingPage';",
    "import TruckTrackingPage from './pages/TruckTrackingPage';\nimport SiloFanPage from './pages/SiloFanPage';"
  );
  code = code.replace(
    '<Route path="truck-tracking" element={<TruckTrackingPage />} />',
    '<Route path="truck-tracking" element={<TruckTrackingPage />} />\n          <Route path="silo-fans" element={<SiloFanPage />} />'
  );
  fs.writeFileSync('frontend/src/App.tsx', code);
  console.log('App.tsx updated');
}
