const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Root container: change `overflow-auto` to `overflow-hidden` so the whole page doesn't scroll vertically
// Instead, let the specific tabs handle overflow if necessary, but overview tab will fit precisely.
content = content.replace(
    'className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-4 overflow-auto"',
    'className="flex flex-col h-screen animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-4 overflow-hidden"'
);

// 2. The Overview tab content container: make it fill remaining space
content = content.replace(
    /className=\{\`flex-col h-full \$\{activeTab === 'overview' \? 'flex' : 'hidden'\}\`\}/g,
    'className={`flex-col flex-1 min-h-0 overflow-hidden ${activeTab === \'overview\' ? \'flex\' : \'hidden\'}`}'
);

// 3. The 3-column Grid for charts: make it flex-1 min-h-0 so it fits in the space
content = content.replace(
    'className="grid grid-cols-3 gap-4 flex-1 mb-4"',
    'className="grid grid-cols-3 gap-4 flex-1 min-h-0 mb-2"' // Reduced mb-4 to mb-2 for more space
);

// 4. Change min-h-[250px] on the 3 grid items to min-h-0, h-full, and add overflow-hidden
content = content.replace(
    /className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-\[250px\]"/g,
    'className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-0"'
);

content = content.replace(
    'className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[250px]"',
    'className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-0"'
);

// 5. Shrink chart container heights from fixed or implicit to 100% height flex
content = content.replace(
    /className="h-64 mt-4"/g,
    'className="flex-1 mt-2 min-h-0"'
);

// 6. Fix Kaizen list overflow
// The Kaizen table is wrapped in <div className="overflow-x-auto">
// We need to make it overflow-y-auto flex-1 min-h-0
content = content.replace(
    '<div className="overflow-x-auto">',
    '<div className="overflow-auto flex-1 min-h-0">'
);

// 7. Make the Electricity tab container scrollable since we hid overflow on root
content = content.replace(
    /<div className=\{\`flex-col h-full \$\{activeTab === 'electricity' \? 'flex' : 'hidden'\}\`\}>/g,
    '<div className={`flex-col flex-1 overflow-auto ${activeTab === \'electricity\' ? \'flex\' : \'hidden\'}`}>\n        {/* Tab Chi tiết Điện năng */}'
);

// 8. Reduce header margin to save space
content = content.replace('mb-6 gap-4', 'mb-3 gap-2');

// 9. Reduce padding on the 4 top cards
content = content.replace(/className="bg-white rounded-xl p-4 /g, 'className="bg-white rounded-xl p-3 ');

// 10. Shrink Text in Kaizen table slightly to fit 3 cols better
content = content.replace('className="w-full text-xs text-left"', 'className="w-full text-[11px] text-left"');
content = content.replace('className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs"', 'className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]"');

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('optimized');
