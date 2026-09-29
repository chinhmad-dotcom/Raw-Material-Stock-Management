const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const regex = /\{\/\* Card 3: Loss \*\/\}[\s\S]*?\{\/\* Card 4: Kaizen \*\/\}/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
}
