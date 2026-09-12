const fs = require('fs');
let code = fs.readFileSync('src/components/extruder/ExtruderReportCheck.tsx', 'utf8');

const oldCalcBlock = `  if (filteredData.length > 0) {
    const latestDayData = filteredData.find(d => d.date === latestDay);
    if (latestDayData && latestDayData.electricity) {
      elecBaoCao = {
        e1: latestDayData.electricity.e1 || 0,
        e2: latestDayData.electricity.e2 || 0,
        hamer: latestDayData.electricity.hamer || 0,
        line: latestDayData.electricity.line || 0
      };
    }
  }`;

const newCalcBlock = `  if (filteredData.length > 0) {
    elecBaoCao = filteredData.reduce((acc, d) => {
      if (d.electricity) {
        acc.e1 += d.electricity.e1 || 0;
        acc.e2 += d.electricity.e2 || 0;
        acc.hamer += d.electricity.hamer || 0;
        acc.line += d.electricity.line || 0;
      }
      return acc;
    }, { e1: 0, e2: 0, hamer: 0, line: 0 });
  }`;

code = code.replace(oldCalcBlock, newCalcBlock);
fs.writeFileSync('src/components/extruder/ExtruderReportCheck.tsx', code);
console.log('Patched frontend to sum consumption');
