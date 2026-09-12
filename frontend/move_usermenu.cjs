const fs = require('fs');

// 1. MainLayout.tsx
let mainLayout = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');
mainLayout = mainLayout.replace(
  '<main className="flex-1 min-w-0 transition-all duration-300">',
  '<main className="flex-1 min-w-0 transition-all duration-300 relative flex flex-col h-screen">\n        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-[100]">\n          <UserMenu />\n        </div>'
);
fs.writeFileSync('src/components/layout/MainLayout.tsx', mainLayout);

// 2. DashboardPage.tsx
let dashboard = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');
dashboard = dashboard.replace(/<UserMenu \/>/g, '');
dashboard = dashboard.replace(
  'header className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 sm:px-3 shadow-panel backdrop-blur-xl relative flex flex-col xl:flex-row items-center justify-center gap-2 shrink-0"',
  'header className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 sm:px-3 sm:pr-[160px] shadow-panel backdrop-blur-xl flex flex-col xl:flex-row items-center justify-between gap-2 shrink-0 min-h-[60px]"'
);
dashboard = dashboard.replace(
  'div className="shrink-0 w-full xl:w-auto xl:absolute xl:left-5 text-center xl:text-left"',
  'div className="shrink-0 w-full xl:w-auto text-center xl:text-left mr-auto"'
);
dashboard = dashboard.replace(
  'div className="flex flex-wrap items-center justify-center gap-2 z-10"',
  'div className="flex flex-wrap items-center justify-end gap-2 z-10 flex-1"'
);
fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', dashboard);

// 3. StockSilo.tsx
let silo = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');
silo = silo.replace(/<UserMenu \/>/g, '');
silo = silo.replace(
  'div className="flex flex-wrap items-center justify-between p-1.5 sm:p-2 bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shadow-sm z-10 gap-2"',
  'div className="flex flex-wrap items-center justify-between p-1.5 sm:p-2 sm:pr-[160px] bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shadow-sm z-10 gap-2 min-h-[60px]"'
);
fs.writeFileSync('src/pages/stock/StockSilo.tsx', silo);

// 4. StockKho.tsx
let kho = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');
kho = kho.replace(/<UserMenu \/>/g, '');
kho = kho.replace(
  'div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-3 shadow-sm"',
  'div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-3 sm:pr-[160px] shadow-sm min-h-[60px]"'
);
fs.writeFileSync('src/pages/stock/StockKho.tsx', kho);

console.log('Moved UserMenu to layout and updated padding');
