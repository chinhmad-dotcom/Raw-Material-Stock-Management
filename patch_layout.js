const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Make the top 4 cards grid more compact and strictly 4 columns
content = content.replace(
    'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"',
    'className="grid grid-cols-4 gap-4 mb-4"'
);

// 2. Reduce padding in all KPI cards from p-5 to p-4
content = content.replace(/className="bg-white rounded-xl p-5 shadow-sm/g, 'className="bg-white rounded-xl p-4 shadow-sm');
content = content.replace(/mb-4/g, 'mb-2'); // Reduce bottom margin of titles in cards

// 3. Put Chart 1, Chart 2, and Kaizen List in a 3-column grid
// Currently it is:
// <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//   {/* Chart 1 */}
//   ...
//   {/* Chart 2 */}
//   ...
// </div>
// {/* Kaizen List Section */}
// <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">

// Change the grid to 3 columns
content = content.replace(
    'className="grid grid-cols-1 lg:grid-cols-2 gap-6"',
    'className="grid grid-cols-3 gap-4 flex-1"'
);

// Merge Kaizen List into the grid
content = content.replace(
    '</div>\n        {/* Kaizen List Section */}\n        <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">',
    '        {/* Kaizen List Section */}\n        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">'
);
// In case the whitespace differs
content = content.replace(
    /<\/div>\s*\{\/\*\s*Kaizen List Section\s*\*\/\}\s*<div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">/,
    '        {/* Kaizen List Section */}\n        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[300px]">'
);


// 4. Reduce Chart paddings from p-5 to p-4 and min-heights
content = content.replace(/className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col"/g, 'className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]"');
content = content.replace(/min-h-\[300px\]/g, 'min-h-[250px]');

// 5. Shrink Kaizen List elements
content = content.replace(/px-4 py-3/g, 'px-2 py-2'); // Padding in Kaizen table
content = content.replace(/px-4 py-4/g, 'px-2 py-2'); // Padding for empty table
content = content.replace(/mb-6/g, 'mb-4'); // General margin bottom
content = content.replace(/gap-6/g, 'gap-4'); // General gaps

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched');
