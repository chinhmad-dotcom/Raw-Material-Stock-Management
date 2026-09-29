const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/dashboard/DashboardPage.tsx', 'utf8');

const regex = /\{loading && \(\s*<div className="rounded-3xl border border-slate-200 dark:border-white\/10 bg-white dark:bg-slate-900\/80 p-6 text-slate-700 dark:text-slate-300 shadow-panel">\s*\{t\('dashboardPage\.loadingContent'\)\}\s*<\/div>\s*\)\}/;

if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync('frontend/src/components/dashboard/DashboardPage.tsx', content);
    console.log('Removed loading text block.');
} else {
    console.log('Not found');
}
