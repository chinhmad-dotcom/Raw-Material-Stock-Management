const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/fanPdfGenerator.ts', 'utf8');

if (code.includes("doc.save(")) {
  code = code.replace(
    "doc.save('Ke_hoach_mo_quat_Silo_' + siloName + '_' + new Date().getTime() + '.pdf');",
    "return doc;"
  );
  fs.writeFileSync('frontend/src/components/fans/fanPdfGenerator.ts', code);
  console.log('fanPdfGenerator.ts updated to return doc');
}
