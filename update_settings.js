const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/SettingsPage.tsx', 'utf8');

c = c.replace(
    "import { LogsTab } from '../features/settings/components/LogsTab';", 
    "import { LogsTab } from '../features/settings/components/LogsTab';\nimport { LocationsTab } from '../features/settings/components/LocationsTab';"
);

c = c.replace(
    /type Tab = 'profile' \| 'accounts' \| 'silos' \| 'materials' \| 'logs';/, 
    "type Tab = 'profile' | 'accounts' | 'silos' | 'locations' | 'materials' | 'logs';"
);

c = c.replace(
    /\{ id: 'silos', label: t\('pages\.settings\.tabs\.silos', 'Location parameters'\), icon: <Container className="h-4 w-4" \/> \},/, 
    `{ id: 'silos', label: t('pages.settings.tabs.silos', 'Location parameters'), icon: <Container className="h-4 w-4" /> },
      { id: 'locations', label: 'Vị trí kho NL', icon: <Container className="h-4 w-4" /> },`
);

c = c.replace(
    /\{activeTab === 'silos' && <SiloTab \/>\}/, 
    `{activeTab === 'silos' && <SiloTab />}\n        {activeTab === 'locations' && <LocationsTab />}`
);

fs.writeFileSync('frontend/src/pages/SettingsPage.tsx', c);
console.log('Updated SettingsPage.tsx');
