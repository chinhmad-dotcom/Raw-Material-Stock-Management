const fs = require('fs');

const files = [
  'frontend/src/components/extruder/ExtruderProduction.tsx',
  'frontend/src/components/extruder/ExtruderOEE.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  const replaceTarget = `// Auto select the most recent month available
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        
      }`;

  const replacement = `// Auto select the most recent month available
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        if (sorted[0]) {
          setSelectedYear(sorted[0].year);
          setSelectedMonth(sorted[0].month);
        }
      }`;

  content = content.replace(replaceTarget, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
