const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// The error is:
//               </ResponsiveContainer>
//             </div>
//                 {/* Kaizen List Section */}
// We need an extra </div> there.

content = content.replace(
    /<\/ResponsiveContainer>\s*<\/div>\s*\{\/\* Kaizen List Section \*\/\}/,
    '</ResponsiveContainer>\n            </div>\n          </div>\n\n          {/* Kaizen List Section */}'
);

// Check if there's now an extra </div> somewhere else because check_tags said 59/59
// If we add one here, we'll have 60 Close and 59 Open. So we must have missed an Open or had an extra Close.
// Let's first apply this fix.
fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('Fixed Kaizen list placement');
