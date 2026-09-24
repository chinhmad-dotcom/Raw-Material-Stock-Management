const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

let divOpen = 0;
let divClose = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
    const opens = (line.match(/<div(\s|>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    divOpen += opens;
    divClose += closes;
});
console.log('Open:', divOpen, 'Close:', divClose);
