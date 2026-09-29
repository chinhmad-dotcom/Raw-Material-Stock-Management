const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const startIndex = content.indexOf('{/* Summary Cards */}');
const endIndex = content.indexOf('{/* Charts Section */}');
const sub = content.substring(startIndex, endIndex);

console.log(sub);
