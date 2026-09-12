const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/stock/StockSilo.tsx', 'utf8');

// Find the outer main div and the first header inside it
const match = c.match(/<div className="flex h-full w-full flex-col.*?">([\s\S]*?)<\/div>/i);
if (match) {
    // wait, instead of complex regex, let's just find the closing tag of the inner header.
    // Looking for: <div className="flex items-center gap-3"> ... </div> </div>
    // Let's replace the outer header flex.
    c = c.replace(/<div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white\/10 bg-white\/80 dark:bg-slate-900\/80 p-3  shadow-sm min-h-\[60px\]">([\s\S]*?)<\/div>/, (fullMatch, group1) => {
        // If it doesn't already have UserMenu
        if (!fullMatch.includes('<UserMenu')) {
            return `<div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-3 shadow-sm min-h-[60px]">${group1}</div>\n        <UserMenu />\n      </div>`;
        }
        return fullMatch;
    });
    
    // Oh wait, the replace above replaces the full `<div...>{group1}</div>`. But the outer div closes at `</div>`.
    // Actually let's use a simpler replace based on the actual file content.
}

console.log(c.substring(c.indexOf('<div className="flex items-center justify-between'), c.indexOf('<div className="flex items-center justify-between') + 400));
