const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/truck/Dashboard.tsx', 'utf8');

c = c.replace(/className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 min-w-\[200px\]"/g, 'className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 min-w-[200px]"');
c = c.replace(/className="font-bold text-slate-800 mb-2"/g, 'className="font-bold text-slate-800 dark:text-slate-100 mb-2"');
c = c.replace(/className="space-y-2 text-sm text-slate-600 max-h-60 overflow-y-auto pr-1"/g, 'className="space-y-2 text-sm text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto pr-1"');
c = c.replace(/className="flex flex-col border-b border-slate-100 pb-1 last:border-0"/g, 'className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-1 last:border-0"');

// Fix the 'flex flex-col' for chart container which we broke earlier by string replace not matching EXACTLY
// Wait, my previous replace was: 
// content.replace('lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4', 'lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4 flex flex-col');
// But the original string was 'lg:col-span-2 bg-white rounded-xl shadow-md p-4' so it didn't match!
// Ah, the original string WAS 'lg:col-span-2 bg-white rounded-xl shadow-md p-4'. Let's check what it is now.
c = c.replace('lg:col-span-2 bg-white rounded-xl shadow-md p-4', 'lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4 flex flex-col');

fs.writeFileSync('frontend/src/components/truck/Dashboard.tsx', c);
console.log('Fixed tooltip and chart flex');
