const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Add </div> to close the grid grid-cols-3
const kaizenEndStr = '</table>\n             </div>\n          </div>';
content = content.replace(kaizenEndStr, kaizenEndStr + '\n        </div>');

// 2. Remove one </div> from the end of the file
content = content.replace(/<\/div>\n    <\/div>\n  \);\n\}/, '</div>\n  );\n}');

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('Fixed div structures');
