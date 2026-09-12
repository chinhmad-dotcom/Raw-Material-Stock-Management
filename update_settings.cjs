const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/SettingsPage.tsx', 'utf8');

code = code.replace(
  "import { LogsTab } from '../features/settings/components/LogsTab';",
  "import { LogsTab } from '../features/settings/components/LogsTab';\nimport { ProfileTab } from '../features/settings/components/ProfileTab';"
);

code = code.replace(
  "type Tab = 'accounts' | 'silos' | 'materials' | 'logs';",
  "type Tab = 'profile' | 'accounts' | 'silos' | 'materials' | 'logs';"
);

code = code.replace(
  "const [activeTab, setActiveTab] = useState<Tab>(isAdmin ? 'accounts' : 'silos');",
  "const [activeTab, setActiveTab] = useState<Tab>('profile');"
);

code = code.replace(
  "if (!isAdmin && activeTab === 'accounts') {\n      setActiveTab('silos');\n    }",
  "if (!isAdmin && activeTab === 'accounts') {\n      setActiveTab('profile');\n    }"
);

code = code.replace(
  "const tabs = [",
  "const tabs = [\n    { id: 'profile', label: 'My Profile', icon: <Users className=\"h-4 w-4\" /> },"
);

code = code.replace(
  "{activeTab === 'accounts' && isAdmin && <AccountTab />}",
  "{activeTab === 'profile' && <ProfileTab />}\n        {activeTab === 'accounts' && isAdmin && <AccountTab />}"
);

fs.writeFileSync('frontend/src/pages/SettingsPage.tsx', code);
console.log('Settings page updated');
