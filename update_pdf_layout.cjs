const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/fanPdfGenerator.ts', 'utf8');

code = code.replace("doc.text('Người báo cáo:', 150, finalY + 30);", "doc.text('Người báo cáo:', 150, finalY + 5);");
code = code.replace("doc.text('Người thẩm tra:', 230, finalY + 30);", "doc.text('Người thẩm tra:', 230, finalY + 5);");
code = code.replace(/finalY \+ 35/g, "finalY + 10");
code = code.replace(/finalY \+ 55/g, "finalY + 30");

fs.writeFileSync('frontend/src/components/fans/fanPdfGenerator.ts', code);
console.log('PDF layout updated');
