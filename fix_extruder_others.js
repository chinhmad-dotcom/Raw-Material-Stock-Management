const fs = require('fs');

const files = [
  'frontend/src/components/extruder/ExtruderOEE.tsx',
  'frontend/src/components/extruder/ExtruderReportCheck.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We are looking for:
  // if (data && data.length > 0) {
  //   const sorted = [...data].sort((a, b) => {
  //     if (a.year !== b.year) return b.year - a.year;
  //     return b.month - a.month;
  //   });
  //   
  // }

  const replaceRegex = /if \(data && data\.length > 0\) \{\s*const sorted = \[\.\.\.data\]\.sort\(\(a, b\) => \{\s*if \(a\.year !== b\.year\) return b\.year - a\.year;\s*return b\.month - a\.month;\s*\}\);\s*\}/;

  const replacement = `if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        if (sorted[0]) {
          setSelectedYear(sorted[0].year);
          setSelectedMonth(sorted[0].month);
        }
      }`;

  content = content.replace(replaceRegex, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
