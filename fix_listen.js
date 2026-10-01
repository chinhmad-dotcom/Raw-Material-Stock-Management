const fs = require('fs');

let c = fs.readFileSync('mock-api/server.js', 'utf8');

const dbFilesList = `
const DB_FILES = [
  'settingsData.json',
  'energyData.json',
  'energyDaily.json',
  'queue-history.json',
  'extruderData.json',
  'fans.json',
  'fumigations.json',
  'records.json',
  'kpiProduction.json',
  'kpiLoss.json',
  'kpiTargets.json',
  'kpiKaizen.json',
  'dailyReceived.json'
];
async function startServer() {
  await syncStartupFiles(DB_FILES);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running at http://localhost:\${PORT}\`);
  });
}
startServer();
`;

// Replace the end
c = c.replace(/server\.listen\(PORT, '0\.0\.0\.0', \(\) => \{ console\.log\('Server is running'\); \}\);/g, dbFilesList);

fs.writeFileSync('mock-api/server.js', c);
console.log('Fixed server.listen replacement');
