const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// Remove the nested grids under Charts Section
const replaceTarget = `{/* Charts Section */}
      <div className="grid grid-cols-3 gap-4 flex-1 mb-4">

        <div className="grid grid-cols-3 gap-4 flex-1">`;
// Normalizing whitespace
const regex = /\{\/\* Charts Section \*\/\}\s*<div className="grid grid-cols-3 gap-4 flex-1 mb-4">\s*<div className="grid grid-cols-3 gap-4 flex-1">/;
if (regex.test(content)) {
    content = content.replace(regex, '{/* Charts Section */}\n        <div className="grid grid-cols-3 gap-4 flex-1 mb-4">');
    
    // Since we removed one open div, we need to remove one close div.
    // The inner grid was closed right before:
    // </div>
    // <div className={`flex-col h-full ${activeTab === 'electricity' ? 'flex' : 'hidden'}`}>
    content = content.replace(/<\/div>\s*<\/div>\s*<div className=\{\`flex-col h-full \$\{activeTab === 'electricity'/, 
        '</div>\n        <div className={`flex-col h-full ${activeTab === \'electricity\'');
        
    fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
    console.log('Fixed nested grids');
} else {
    console.log('Not found');
}
