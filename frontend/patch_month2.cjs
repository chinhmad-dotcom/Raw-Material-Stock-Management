const fs = require('fs');

let code = fs.readFileSync('../mock-api/server.js', 'utf8');

const targetStr = `        const filename = uploadedFile.originalFilename || '';
        const match = /(?:T|-|_|\\s|^)(0?[1-9]|1[0-2])[-_.\\/](20\\d\\d)/i.exec(filename);
        if (match) {
          reportMonth = parseInt(match[1], 10);
          reportYear = parseInt(match[2], 10);
        }`;

const replacement = `        const filename = uploadedFile.originalFilename || '';
        
        const matchMMYYYY = /(?:T|-|_|\\s|^)(0?[1-9]|1[0-2])[-_.\\/](20\\d\\d)/i.exec(filename);
        const matchYYYYMM = /(20\\d\\d)[-_.\\/](0?[1-9]|1[0-2])/i.exec(filename);
        
        if (matchMMYYYY) {
          reportMonth = parseInt(matchMMYYYY[1], 10);
          reportYear = parseInt(matchMMYYYY[2], 10);
        } else if (matchYYYYMM) {
          reportYear = parseInt(matchYYYYMM[1], 10);
          reportMonth = parseInt(matchYYYYMM[2], 10);
        }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('../mock-api/server.js', code);
console.log('Patched mock-api to parse YYYY-MM as well');
