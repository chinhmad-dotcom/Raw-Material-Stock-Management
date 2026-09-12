const fs = require('fs');
let code = fs.readFileSync('frontend/src/main.tsx', 'utf8');
if (!code.includes('./i18n/i18n')) {
  code = "import './i18n/i18n';\n" + code;
  fs.writeFileSync('frontend/src/main.tsx', code);
  console.log('Imported i18n');
}
