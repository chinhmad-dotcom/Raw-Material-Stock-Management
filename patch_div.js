const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

content = content.replace(
    /<div className=\{\`flex-col h-full \$\{activeTab === 'electricity' \? 'flex' : 'hidden'\}\`\}>/,
    '</div>\n        <div className={`flex-col h-full ${activeTab === \'electricity\' ? \'flex\' : \'hidden\'}`}>'
);

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched');
