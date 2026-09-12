const fs = require('fs');

let db = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');
db = db.replace(/<th className="py-2/g, '<th className="py-1');
db = db.replace('text-lg sm:text-xl font-bold uppercase tracking-wider', 'text-base sm:text-lg font-bold uppercase tracking-wider');

fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', db, 'utf8');
console.log('Optimized table headers');
