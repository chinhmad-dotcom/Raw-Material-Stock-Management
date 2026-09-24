const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Extract the Kaizen card block
const cardRegex = /\s*\{\/\* Card 4: Kaizen \*\/\}\s*<div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const match = content.match(cardRegex);
if (!match) {
    console.log("Card 4 not found");
    process.exit(1);
}

const kaizenCardStr = match[0];
content = content.replace(cardRegex, ''); // Remove it from charts section

// 2. Insert it before the end of the cards grid.
// Let's find Card 3 which has "Kiểm soát Loss".
const card3Regex = /<div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">\s*<div className="flex justify-between items-center mb-2">\s*<div className="flex items-center gap-2 text-slate-600 font-semibold">\s*<Zap className="w-5 h-5 text-blue-500" \/>\s*Kiểm soát Loss[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const match3 = content.match(card3Regex);
if (!match3) {
    console.log("Card 3 not found");
    process.exit(1);
}

content = content.replace(card3Regex, (m) => m + kaizenCardStr);

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('fixed');
