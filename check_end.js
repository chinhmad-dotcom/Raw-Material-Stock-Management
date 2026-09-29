const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const regex = /<table className="w-full text-\[11px\] text-left">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/;
const match = content.match(regex);
if (match) {
    const endStr = content.substring(match.index + match[0].length, match.index + match[0].length + 500);
    console.log(endStr);
} else {
    console.log('Not found');
}
