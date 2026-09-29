const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const card4Regex = /(\s*\{\/\* Card 4: Kaizen \*\/\}\s*<div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;

const match = content.match(card4Regex);
if (!match) {
    console.log("Card 4 not found");
    process.exit(1);
}

const card4Str = match[0];

// Remove card 4
content = content.replace(card4Regex, '');

// Find where to insert it. We want it inside the `grid-cols-4` grid.
// Find the `</div>` that closes `Card 3: Loss`, and the `</div>` that closes the grid.
// Card 3 ends with:
//               </span>
//            </div>
//          </div>
//        </div>

const insertTarget = '               </span>\n            </div>\n          </div>\n        </div>';
if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, '               </span>\n            </div>\n          </div>' + card4Str + '\n        </div>');
    fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
    console.log("Fixed by exact string match");
} else {
    // Fallback: regex search for the end of Card 3
    const card3EndRegex = /(<\/span>\s*<\/div>\s*<\/div>)\s*<\/div>/;
    if (card3EndRegex.test(content)) {
        content = content.replace(card3EndRegex, `$1\n${card4Str}\n        </div>`);
        fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
        console.log("Fixed by regex");
    } else {
        console.log("Could not find where to insert Card 4");
    }
}
