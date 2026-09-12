const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/FanPlanList.tsx', 'utf8');
code = code.replace("doc.output('bloburl')", "doc.output('datauristring') as any as string");
fs.writeFileSync('frontend/src/components/fans/FanPlanList.tsx', code);
console.log('Fixed bloburl error');
