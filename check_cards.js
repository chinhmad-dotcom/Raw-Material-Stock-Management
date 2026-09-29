const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const regex = /\{\/\* Summary Cards \*\/\}([\s\S]*?)\{\/\* Charts Section \*\/\}/;
const match = content.match(regex);
if (match) {
    console.log(match[1]);
}
