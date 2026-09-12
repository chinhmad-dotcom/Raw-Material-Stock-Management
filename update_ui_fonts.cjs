const fs = require('fs');

// Fix FanPlanForm
let formCode = fs.readFileSync('frontend/src/components/fans/FanPlanForm.tsx', 'utf8');
formCode = formCode.replace('text-[10px]', 'text-xs');
formCode = formCode.replace('text-base font-bold text-slate-800 dark:text-slate-100', 'text-lg font-bold text-black dark:text-white');
// Add black text to inputs
formCode = formCode.replace(/text-sm px-2 py-1/g, 'text-sm px-2 py-1 text-black dark:text-white');
fs.writeFileSync('frontend/src/components/fans/FanPlanForm.tsx', formCode);

// Fix FanPlanList
let listCode = fs.readFileSync('frontend/src/components/fans/FanPlanList.tsx', 'utf8');
listCode = listCode.replace('text-[10px]', 'text-xs text-black dark:text-white');
listCode = listCode.replace('text-sm font-bold text-slate-800 dark:text-slate-100', 'text-lg font-bold text-black dark:text-white');
listCode = listCode.replace('text-slate-600 dark:text-slate-300', 'text-black dark:text-white font-bold text-xs');
listCode = listCode.replace(/text-blue-600/g, 'text-black dark:text-white');
// Don't replace emerald-600 universally because of buttons and badges. 
// Just target the th explicitly
listCode = listCode.replace(/<th className="px-2 py-1 border dark:border-slate-700 text-center text-emerald-600"/g, '<th className="px-2 py-1 border dark:border-slate-700 text-center text-black dark:text-white font-bold"');
listCode = listCode.replace(/<th className="px-2 py-1 border dark:border-slate-700 text-emerald-600"/g, '<th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white font-bold"');

// Fix the rows to have black text
listCode = listCode.replace(/<tr key=\{r.id \|\| idx\}/g, '<tr key={r.id || idx} className="text-black dark:text-white font-medium border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"');
// Clear the redundant className in tr
listCode = listCode.replace(/className="text-black dark:text-white font-medium border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800\/50" className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800\/50"/g, 'className="text-black dark:text-white font-medium border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"');

fs.writeFileSync('frontend/src/components/fans/FanPlanList.tsx', listCode);
console.log('UI styling updated successfully');
