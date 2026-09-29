const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

let depth = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('activeTab === \'electricity\'')) {
        console.log(`Line ${i}: depth ${depth} - ${line.trim()}`);
    }
    const opens = (line.match(/<div(\s|>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    if (line.includes('activeTab === \'loss\'')) {
        console.log(`Line ${i}: depth ${depth} - ${line.trim()}`);
    }
}
