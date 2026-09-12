const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(
  `if (settingsUpdated) { saveSettings(settingsData);
              if (resource === 'materials' || resource === 'silos') {
                let newData = parseExcelReport(getLatestFilePath());
                if (newData) {
                  parsedData = newData;
                  syncMaterialsToSettings(parsedData.materials);
                }
              } } }`,
  `if (settingsUpdated) { saveSettings(settingsData); } }`
);

fs.writeFileSync('server.js', code);
console.log('Fixed resource variable reference');
