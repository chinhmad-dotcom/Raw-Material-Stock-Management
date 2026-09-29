const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

let depth = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('activeTab === \'overview\'') && line.includes('<div')) {
        console.log(`Line ${i}: depth ${depth} - START OVERVIEW`);
    }
    if (line.includes('Charts Section')) {
        console.log(`Line ${i}: depth ${depth} - CHARTS SECTION`);
    }
    if (line.includes('activeTab === \'electricity\'') && line.includes('<div')) {
        console.log(`Line ${i}: depth ${depth} - START ELECTRICITY`);
    }
    
    const opens = (line.match(/<div(\s|>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
}
console.log('Final depth:', depth);
