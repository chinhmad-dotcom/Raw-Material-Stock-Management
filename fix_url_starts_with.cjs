const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');

code = code.replace(/if \(url === '\/api\/records'/g, "if (reqPath === '/api/records'");
code = code.replace(/if \(url\.startsWith\('\/api\/records\/monthly-report'\)/g, "if (reqPath.startsWith('/api/records/monthly-report')");
code = code.replace(/if \(url === '\/api\/records\/reasons'/g, "if (reqPath === '/api/records/reasons'");
code = code.replace(/if \(url\.startsWith\('\/api\/records\/clear-by-month'\)/g, "if (reqPath.startsWith('/api/records/clear-by-month')");

fs.writeFileSync('mock-api/server.js', code);
console.log('Fixed url.startsWith error in mock-api');
