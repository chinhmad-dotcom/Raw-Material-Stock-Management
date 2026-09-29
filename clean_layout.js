const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// Fix top grid
content = content.replace(
    'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"',
    'className="grid grid-cols-4 gap-4 mb-4"'
);

// Fix bottom grid which has nested grids
content = content.replace(
    /<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mb-4">\s*<div className="grid grid-cols-3 gap-4 flex-1">/,
    '<div className="grid grid-cols-3 gap-4 flex-1 mb-4">'
);

// Remove the extra closing div for the nested grid
// The structure was:
// <div class="grid grid-cols-3...">
//   Chart 1
//   Chart 2
//   Kaizen List
// </div> 
// </div> <- This extra one
// We will just run check_tags to see if we have unbalanced divs.

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('cleaned');
