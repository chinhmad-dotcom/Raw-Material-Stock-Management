const fs = require('fs');

// StockSilo.tsx
let siloContent = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');
siloContent = siloContent.replace(
    /const \{ summary, loadDashboard \} = useDashboardStore\(\);/,
    'const { summary, selectedDate, loadDashboard } = useDashboardStore();'
);
siloContent = siloContent.replace(
    /<h1 className="text-lg md:text-xl font-black tracking-wider text-slate-800 dark:text-slate-100">SILO<\/h1>/,
    `<h1 className="text-lg md:text-xl font-black tracking-wider text-slate-800 dark:text-slate-100">SILO</h1>
            <span className="text-xs md:text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">Ngày cập nhật: {selectedDate || '---'}</span>`
);
fs.writeFileSync('frontend/src/pages/stock/StockSilo.tsx', siloContent);

// StockKho.tsx
let khoContent = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
khoContent = khoContent.replace(
    /const \{ summary, loadDashboard \} = useDashboardStore\(\);/,
    'const { summary, selectedDate, loadDashboard } = useDashboardStore();'
);
khoContent = khoContent.replace(
    /<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">\{t\('pages\.stockKho\.title', 'Sơ Đồ Kho'\)\}<\/h2>/,
    `<div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('pages.stockKho.title', 'Sơ Đồ Kho')}</h2>
                <span className="text-xs md:text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">Ngày cập nhật: {selectedDate || '---'}</span>
              </div>`
);
fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', khoContent);

console.log('Headers updated correctly.');
