const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');
const tailRegex = /      \}\)\}\s*<\/div>\s*\)\s*;\s*\}\s*;\s*export default StockKho;/;
const match = c.match(tailRegex);

if (match) {
   // Wait, if it didn't match before... Let's just fix it by replacing the whole end part manually.
}
// Actually, let's just append the missing `</div>` before `);` 
const parts = c.split('  );\n};\n\nexport default StockKho;');
if (parts.length === 2) {
    c = parts[0] + '    </div>\n  );\n};\n\nexport default StockKho;';
    fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', c);
    console.log('Fixed end of StockKho');
} else {
    const parts2 = c.split('  );\n};\nexport default StockKho;');
    if (parts2.length === 2) {
        c = parts2[0] + '    </div>\n  );\n};\nexport default StockKho;';
        fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', c);
        console.log('Fixed end of StockKho (v2)');
    } else {
        console.log('Could not find split point. parts length:', parts.length);
    }
}
