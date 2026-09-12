const fs = require('fs');
const path = require('path');

const srcDir = 'G:/App/RMS-BDG-TRACKER/frontend/src/components';
const destDir = 'G:/App/StockRM/frontend/src/components/truck';
const filesToCopy = ['Dashboard.tsx', 'DataEntryForm.tsx', 'ReportingTab.tsx'];

for (const file of filesToCopy) {
  let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  
  // Replace import path for api
  content = content.replace(/from '..\/services\/api'/g, "from '../../api/truckApi'");
  content = content.replace(/from '..\/..\/services\/api'/g, "from '../../api/truckApi'");
  
  // They might also import contexts or icons. We'll leave lucide-react alone.
  // SettingsContext might be used? Let's check.
  
  fs.writeFileSync(path.join(destDir, file), content);
  console.log(`Copied ${file}`);
}
