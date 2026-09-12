const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/truck/Dashboard.tsx', 'utf8');

// Container
content = content.replace('<div className="space-y-4">', '<div className="flex flex-col h-full gap-4">');

// Header
content = content.replace('bg-white p-4 rounded-xl shadow-sm border border-slate-100', 'bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/10 shrink-0');
content = content.replace('text-xl font-bold text-slate-800 hidden sm:block', 'text-xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block');

// Selects
content = content.replace(/border border-slate-300 rounded-lg px-4 py-2 text-slate-700/g, 'bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200');

// Loading
content = content.replace('bg-white rounded-xl shadow-md', 'bg-white dark:bg-slate-900 rounded-xl shadow-md');

// KPIs
content = content.replace(/bg-white rounded-xl shadow-md p-4/g, 'bg-white dark:bg-slate-900 rounded-xl shadow-md p-4');
content = content.replace(/text-slate-800 mt-2/g, 'text-slate-800 dark:text-slate-100 mt-2');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/bg-blue-100/g, 'bg-blue-100 dark:bg-blue-900/40');
content = content.replace(/bg-indigo-100/g, 'bg-indigo-100 dark:bg-indigo-900/40');
content = content.replace(/bg-green-100/g, 'bg-green-100 dark:bg-green-900/40');

// Chart grids
// We also want to make the KPI grid shrink-0
content = content.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-4">', '<div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">');

content = content.replace('grid grid-cols-1 lg:grid-cols-3 gap-4', 'grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 pb-2');

// Main Chart headers
content = content.replace(/text-xl font-bold text-slate-800 mb-4/g, 'text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 shrink-0');
// Main Chart container
content = content.replace('h-[250px] w-full', 'flex-1 min-h-[200px] w-full');
// In the chart div, we need it to be flex flex-col to let chart expand
content = content.replace('lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4', 'lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-md p-4 flex flex-col');

// Top reasons texts
content = content.replace(/text-slate-700 font-medium/g, 'text-slate-700 dark:text-slate-300 font-medium');
content = content.replace(/text-slate-900 font-bold/g, 'text-slate-900 dark:text-slate-100 font-bold');
content = content.replace(/text-slate-400 text-sm/g, 'text-slate-400 dark:text-slate-500 text-sm');

// Top reasons empty state
content = content.replace(/bg-slate-50 rounded-full/g, 'bg-slate-50 dark:bg-slate-800 rounded-full');
content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400');
content = content.replace(/border border-red-100/g, 'border border-red-100 dark:border-red-500/20');


fs.writeFileSync('frontend/src/components/truck/Dashboard.tsx', content);
console.log('Fixed Truck Tracking Dashboard');
