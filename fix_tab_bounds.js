const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Remove one </div> before Charts Section
// Currently it is:
//           </div>
//           </div>
// 
//       {/* Charts Section */}
content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* Charts Section \*\/\}/, '</div>\n\n      {/* Charts Section */}');

// 2. Add one </div> before Electricity tab
// Currently it is:
//       </div>
//         <div className={`flex-col flex-1 overflow-auto ${activeTab === 'electricity' ? 'flex' : 'hidden'}`}>
content = content.replace(
    /<\/div>\s*<div className=\{\`flex-col flex-1 overflow-auto \$\{activeTab === 'electricity'/,
    '</div>\n      </div>\n        <div className={`flex-col flex-1 overflow-auto ${activeTab === \'electricity\''
);

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('Fixed tab boundaries');
