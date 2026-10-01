const fs = require('fs');
let c = fs.readFileSync('mock-api/server-firestore.js', 'utf8');

c = c.replace(/\(queueHistory, fans, fumigations, records, kpiKaizen, extruderData\)/, '// (queueHistory, fans, fumigations, records, kpiKaizen, extruderData)');

fs.writeFileSync('mock-api/server-firestore.js', c);
console.log('Fixed syntax error');
