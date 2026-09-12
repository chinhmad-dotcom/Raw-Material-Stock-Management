const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// The replacement logic
code = code.replace(
  `const today = new Date().toISOString().split('T')[0];
            fs.copyFileSync(uploadedFile.filepath, path.join(UPLOADS_DIR, today + '.xlsx'));`,
  `// Extract date from Excel
            let reportDate = new Date().toISOString().split('T')[0];
            try {
              const wb = XLSX.readFile(uploadedFile.filepath, { cellDates: false });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const cell = ws['L7'];
              if (cell) {
                  if (cell.t === 'n') {
                      const parsed = XLSX.SSF.parse_date_code(cell.v);
                      reportDate = \`\${parsed.y}-\${String(parsed.m).padStart(2, '0')}-\${String(parsed.d).padStart(2, '0')}\`;
                  } else if (cell.w || cell.v) {
                      const d = new Date(cell.w || cell.v);
                      if (!isNaN(d.getTime())) {
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          reportDate = \`\${y}-\${m}-\${day}\`;
                      }
                  }
              }
            } catch(e) { console.error('Failed to extract date', e); }
            fs.copyFileSync(uploadedFile.filepath, path.join(UPLOADS_DIR, reportDate + '.xlsx'));`
);

fs.writeFileSync('server.js', code);
console.log('Fixed upload date extraction');
