const fs = require('fs');

let code = fs.readFileSync('mock-api/server.js', 'utf8');
code = code.replace(
  'createdAt: new Date().toISOString()',
  'createdAt: new Date().toISOString(),\n        status: data.status || \'pending\',\n        reporterSignature: data.reporterSignature || null,\n        reporterName: data.reporterName || null,\n        reviewerSignature: data.reviewerSignature || null,\n        reviewerName: data.reviewerName || null'
);
fs.writeFileSync('mock-api/server.js', code);
console.log('mock-api updated');
