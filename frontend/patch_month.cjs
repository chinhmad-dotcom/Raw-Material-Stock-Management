const fs = require('fs');

let code = fs.readFileSync('../mock-api/server.js', 'utf8');

const targetStr = `        const reportMonth = new Date().getMonth() + 1;
        const reportYear = new Date().getFullYear();`;

const replacement = `        let reportMonth = new Date().getMonth() + 1;
        let reportYear = new Date().getFullYear();
        
        // Try to parse month and year from filename
        const filename = uploadedFile.originalFilename || '';
        const match = /(?:T|-|_|\\s|^)(0?[1-9]|1[0-2])[-_.\\/](20\\d\\d)/i.exec(filename);
        if (match) {
          reportMonth = parseInt(match[1], 10);
          reportYear = parseInt(match[2], 10);
        }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('../mock-api/server.js', code);
console.log('Patched mock-api to parse month and year from filename');
