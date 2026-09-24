const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// For Electricity Table and Loss Table:
// We want to reduce padding, text size, and input widths

// Reduce input width from w-20 to w-14
content = content.replace(/w-20 px-2/g, 'w-14 px-1 text-xs');

// Reduce table padding from px-4 to px-1 or px-2
// Table header
content = content.replace(/px-4 py-3 border-b border-slate-200/g, 'px-2 py-2 border-b border-slate-200 text-[10px] md:text-xs');
// Table rows (electricity)
content = content.replace(/px-4 py-2/g, 'px-2 py-1.5 text-xs');
// Table rows with py-3
content = content.replace(/px-4 py-3/g, 'px-2 py-2 text-xs');

// Change text-sm on the table itself to text-xs
content = content.replace(/className="w-full text-sm text-left/g, 'className="w-full text-xs text-left');

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched');
