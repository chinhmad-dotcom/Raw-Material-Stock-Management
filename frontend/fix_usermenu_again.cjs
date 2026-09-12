const fs = require('fs');

// 1. Revert MainLayout.tsx to original structure
let mainLayout = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');
mainLayout = mainLayout.replace(
  /<main className="flex-1 min-w-0 transition-all duration-300 relative flex flex-col h-screen">[\s\S]*?<div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-\[100\]">[\s\S]*?<\/div>[\s\S]*?<Outlet \/>[\s\S]*?<\/main>/,
  '<main className="flex-1 min-w-0 transition-all duration-300">\n        <Outlet />\n      </main>'
);
fs.writeFileSync('src/components/layout/MainLayout.tsx', mainLayout);

// 2. Add UserMenu back to DashboardPage.tsx
let dashboard = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');
if (!dashboard.includes('<UserMenu />')) {
  // Ensure it's imported
  if (!dashboard.includes('import { UserMenu }')) {
    dashboard = "import { UserMenu } from '../layout/UserMenu';\n" + dashboard;
  }
  dashboard = dashboard.replace(
    '</label>\n          </div>\n        </header>',
    '</label>\n          </div>\n          <UserMenu />\n        </header>'
  );
  // Remove the hardcoded pr-[160px]
  dashboard = dashboard.replace('sm:pr-[160px]', '');
}
fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', dashboard);

// 3. Add UserMenu back to StockSilo.tsx
let silo = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');
if (!silo.includes('<UserMenu />')) {
  if (!silo.includes('import { UserMenu }')) {
    silo = "import { UserMenu } from '../../components/layout/UserMenu';\n" + silo;
  }
  silo = silo.replace(
    '{alertCount} Cảnh Báo\n            </span>\n          )}\n        </div>\n      </div>',
    '{alertCount} Cảnh Báo\n            </span>\n          )}\n        </div>\n        <UserMenu />\n      </div>'
  );
  silo = silo.replace('sm:pr-[160px]', '');
}
fs.writeFileSync('src/pages/stock/StockSilo.tsx', silo);

// 4. Add UserMenu back to StockKho.tsx
let kho = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');
if (!kho.includes('<UserMenu />')) {
  if (!kho.includes('import { UserMenu }')) {
    kho = "import { UserMenu } from '../../components/layout/UserMenu';\n" + kho;
  }
  kho = kho.replace(
    '<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sơ Đồ Kho</h2>\n            \n          </div>\n        </div>\n      </div>',
    '<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sơ Đồ Kho</h2>\n            \n          </div>\n        </div>\n        <UserMenu />\n      </div>'
  );
  kho = kho.replace('sm:pr-[160px]', '');
}
fs.writeFileSync('src/pages/stock/StockKho.tsx', kho);

// 5. Add UserMenu to SettingsPage.tsx
let settings = fs.readFileSync('src/features/settings/pages/SettingsPage.tsx', 'utf8');
if (!settings.includes('<UserMenu />')) {
  if (!settings.includes('import { UserMenu }')) {
    settings = "import { UserMenu } from '../../../components/layout/UserMenu';\n" + settings;
  }
  // Find the header div and add UserMenu at the end of it
  settings = settings.replace(
    /<div className="mb-6">\n        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings<\/h1>\n        <p className="text-slate-500 dark:text-slate-400">Manage system configuration, users, and audit logs<\/p>\n      <\/div>/,
    '<div className="mb-6 flex justify-between items-start">\n        <div>\n          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings</h1>\n          <p className="text-slate-500 dark:text-slate-400">Manage system configuration, users, and audit logs</p>\n        </div>\n        <UserMenu />\n      </div>'
  );
}
fs.writeFileSync('src/features/settings/pages/SettingsPage.tsx', settings);

console.log('Restored UserMenu to headers');
