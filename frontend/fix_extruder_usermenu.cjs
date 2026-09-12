const fs = require('fs');

let extruder = fs.readFileSync('src/pages/ExtruderPage.tsx', 'utf8');
if (!extruder.includes('<UserMenu />')) {
  if (!extruder.includes('import { UserMenu }')) {
    extruder = "import { UserMenu } from '../components/layout/UserMenu';\n" + extruder;
  }
  extruder = extruder.replace(
    /\{\/\* Right Section \(Empty Space for Fixed UserMenu\) \*\/\}\n        <div className="w-\[120px\] sm:w-\[160px\] shrink-0"><\/div>/,
    '<UserMenu />'
  );
}
fs.writeFileSync('src/pages/ExtruderPage.tsx', extruder);

console.log('Fixed ExtruderPage');
