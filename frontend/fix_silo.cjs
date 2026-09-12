const fs = require('fs');

// 1. StockSilo.tsx
let silo = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// Add import UserMenu
if (!silo.includes('UserMenu')) {
  silo = silo.replace("import { PackageOpen, Loader2, UploadCloud, Search } from 'lucide-react';", 
                      "import { PackageOpen, Loader2, UploadCloud, Search } from 'lucide-react';\nimport { UserMenu } from '../components/layout/UserMenu';");
}

// Add UserMenu to header, optimize spacing
silo = silo.replace(
  '<div className="flex flex-wrap items-center justify-between p-2 sm:p-3 bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shadow-sm z-10 gap-2">',
  '<div className="flex flex-wrap items-center justify-between p-1.5 sm:p-2 bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shadow-sm z-10 gap-2">'
);
silo = silo.replace(
  '          <h1 className="text-xl md:text-2xl font-black tracking-wider text-slate-800 dark:text-slate-100">SILO</h1>',
  '          <h1 className="text-lg md:text-xl font-black tracking-wider text-slate-800 dark:text-slate-100">SILO</h1>'
);
silo = silo.replace(
  '        </div>\n        \n      </div>',
  '        </div>\n        <UserMenu />\n      </div>'
);

// Fix overlapping SVG IDs for glass gradient
silo = silo.replace(/id="glass"/g, 'id={`glass-${siloCode}`}');
silo = silo.replace(/url\(#glass\)/g, 'url(#glass-${siloCode})'); // we will replace it correctly

// wait, let's use regex correctly for the fill
silo = silo.replace(/fill="url\(#glass\)"/g, 'fill={`url(#glass-${siloCode})`}');

// also reduce padding inside sections
silo = silo.replace(/p-2 shadow-sm w-full xl:flex-\[4\]/g, 'p-1.5 shadow-sm w-full xl:flex-[4]');
silo = silo.replace(/p-2 shadow-sm w-full xl:flex-\[2\]/g, 'p-1.5 shadow-sm w-full xl:flex-[2]');
silo = silo.replace(/p-2 shadow-sm w-full xl:flex-\[3\]/g, 'p-1.5 shadow-sm w-full xl:flex-[3]');
silo = silo.replace(/gap-2 w-full/g, 'gap-1.5 w-full');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', silo, 'utf8');

console.log('Fixed StockSilo');
