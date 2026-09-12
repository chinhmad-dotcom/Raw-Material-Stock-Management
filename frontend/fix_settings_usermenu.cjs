const fs = require('fs');

let settings = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
if (!settings.includes('<UserMenu />')) {
  if (!settings.includes('import { UserMenu }')) {
    settings = "import { UserMenu } from '../components/layout/UserMenu';\n" + settings;
  }
  // Find the header div and add UserMenu at the end of it
  settings = settings.replace(
    /<div className="mb-6">\n        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings<\/h1>\n        <p className="text-slate-500 dark:text-slate-400">Manage system configuration, users, and audit logs<\/p>\n      <\/div>/,
    '<div className="mb-6 flex justify-between items-start">\n        <div>\n          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings</h1>\n          <p className="text-slate-500 dark:text-slate-400">Manage system configuration, users, and audit logs</p>\n        </div>\n        <UserMenu />\n      </div>'
  );
}
fs.writeFileSync('src/pages/SettingsPage.tsx', settings);

console.log('Fixed SettingsPage');
