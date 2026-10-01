const fs = require('fs');

let c = fs.readFileSync('mock-api/server.js', 'utf8');

if (!c.includes('firebaseStorage')) {
  // 1. Add imports
  c = "const { syncStartupFiles, uploadToFirebase } = require('./firebaseStorage');\n" + c;

  // 2. Wrap fs.writeFileSync
  // We will create a helper function saveFileWithSync
  const helper = `
function saveFileWithSync(filePath, data, encoding = 'utf8') {
  fs.writeFileSync(filePath, data, encoding);
  const fileName = path.basename(filePath);
  if (fileName.endsWith('.json')) {
    // Fire and forget upload
    uploadToFirebase(filePath, fileName).catch(console.error);
  }
}
`;
  c = c.replace("const XLSX = require('xlsx');", "const XLSX = require('xlsx');\n" + helper);

  // 3. Replace fs.writeFileSync with saveFileWithSync globally (but exclude the one inside saveFileWithSync itself)
  // To be safe, we just replace all "fs.writeFileSync" and then fix the helper back
  c = c.replace(/fs\.writeFileSync/g, 'saveFileWithSync');
  c = c.replace(/function saveFileWithSync\(filePath, data, encoding = 'utf8'\) {\n  saveFileWithSync/, 
                "function saveFileWithSync(filePath, data, encoding = 'utf8') {\n  fs.writeFileSync");

  // 4. Change server.listen
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
  server.listen(PORT, () => {
    console.log(\`Server running at http://localhost:\${PORT}\`);
  });
}
startServer();
`;
  c = c.replace(/server\.listen\([^;]+;\n}\);?/, dbFilesList);

  fs.writeFileSync('mock-api/server.js', c);
  console.log('Patched server.js for Firebase Storage Sync');
} else {
  console.log('Already patched');
}
