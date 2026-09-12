const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The problematic string in server.js
const regex = /if \(settingsUpdated\) \{ saveSettings\(settingsData\);\s+if \(resource === 'materials'.*?syncMaterialsToSettings\(parsedData\.materials\);\s+\}\s+\} \} \}/s;
code = code.replace(regex, 'if (settingsUpdated) { saveSettings(settingsData); } }');

fs.writeFileSync('server.js', code);
console.log('Fixed resource variable reference, second try');
