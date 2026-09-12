const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(`const path = url.pathname.toLowerCase();`, `const reqPath = url.pathname.toLowerCase();`);
code = code.replace(/if \(path ===/g, 'if (reqPath ===');
code = code.replace(/\|\| path ===/g, '|| reqPath ===');
code = code.replace(/if \(\(path ===/g, 'if ((reqPath ===');
code = code.replace(/if \(path\.startsWith/g, 'if (reqPath.startsWith');

// Ensure we fix the upload issue: fs.copyFileSync(uploadedFile.filepath, path.join(UPLOADS_DIR, today + '.xlsx'));
// It should now use the actual 'path' module correctly.

fs.writeFileSync('server.js', code);
console.log('Fixed path shadowing');
