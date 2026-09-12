const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(/path\.split\('\/'\)/g, "reqPath.split('/')");

fs.writeFileSync('server.js', code);
console.log('Fixed path.split error');
