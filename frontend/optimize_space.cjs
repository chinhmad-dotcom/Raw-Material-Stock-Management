const fs = require('fs');

// 1. DashboardPage.tsx
let db = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');
db = db.replace('gap-2 px-2 py-2', 'gap-1 px-1 py-1');
db = db.replace('p-3 sm:px-5 shadow-panel backdrop-blur-xl relative flex flex-col xl:flex-row items-center justify-center gap-4', 'p-2 sm:px-3 shadow-panel backdrop-blur-xl relative flex flex-col xl:flex-row items-center justify-center gap-2');
db = db.replace('gap-3 z-10', 'gap-2 z-10');
db = db.replace('gap-4 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 px-4 py-1.5', 'gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 px-2.5 py-1');
db = db.replace('gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6', 'gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-6');
db = db.replace('gap-2 lg:grid-cols-[6fr_4fr] xl:grid-cols-[6.5fr_3.5fr]', 'gap-1 lg:grid-cols-[6fr_4fr] xl:grid-cols-[6.5fr_3.5fr]');
db = db.replace('p-4 sm:p-5 shadow-panel flex flex-col h-full min-h-0', 'p-2 sm:p-3 shadow-panel flex flex-col h-full min-h-0');
db = db.replace('mb-2 flex items-center justify-between shrink-0', 'mb-1 flex items-center justify-between shrink-0');
db = db.replace(/py-2\.5/g, 'py-1.5');
db = db.replace(/p-2\.5 sm:p-3/g, 'p-1.5 sm:p-2');
db = db.replace(/gap-2 min-h-\[60px\]/g, 'gap-1.5 min-h-[48px]');

fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', db, 'utf8');

// 2. AlertsPanel.tsx
let ap = fs.readFileSync('src/components/dashboard/AlertsPanel.tsx', 'utf8');
ap = ap.replace('p-4 sm:p-5', 'p-2 sm:p-3');
ap = ap.replace('mb-2', 'mb-1');
ap = ap.replace('gap-2', 'gap-1');
ap = ap.replace('px-3 py-2.5', 'px-2 py-1.5');
fs.writeFileSync('src/components/dashboard/AlertsPanel.tsx', ap, 'utf8');

// 3. TopImportedMaterials.tsx
let top = fs.readFileSync('src/components/dashboard/TopImportedMaterials.tsx', 'utf8');
top = top.replace('p-3 shadow-panel', 'p-2 shadow-panel');
top = top.replace('mb-2 flex flex-col', 'mb-1 flex flex-col');
fs.writeFileSync('src/components/dashboard/TopImportedMaterials.tsx', top, 'utf8');

console.log('Optimized padding and gaps');
