const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/SettingsPage.tsx', 'utf8');

c = c.replace(/import \{ LocationsTab \} from '\.\.\/features\/settings\/components\/LocationsTab';\n/g, "");

c = c.replace(/type Tab = 'profile' \| 'accounts' \| 'silos' \| 'locations' \| 'materials' \| 'logs';/g, 
  "type Tab = 'profile' | 'accounts' | 'silos' | 'materials' | 'logs';");

c = c.replace(/\{ id: 'locations', label: 'Vị trí kho NL', icon: <Container className="h-4 w-4" \/> \},\s*/g, "");

c = c.replace(/\{activeTab === 'locations' && <LocationsTab \/>\}\s*/g, "");

fs.writeFileSync('frontend/src/pages/SettingsPage.tsx', c);
console.log('Reverted SettingsPage.tsx');
