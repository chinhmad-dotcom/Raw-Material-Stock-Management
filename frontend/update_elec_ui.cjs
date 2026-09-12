const fs = require('fs');

let code = fs.readFileSync('src/components/extruder/ExtruderReportCheck.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// 1. Inject elecBaoCao calculation
const target1 = `let latestDay = 1;`;
const replacement1 = `let elecBaoCao = { e1: 0, e2: 0, hamer: 0, line: 0 };\n  let latestDay = 1;`;
code = code.replace(target1, replacement1);

const target2 = `  const latestDateStr =`;
const replacement2 = `
  if (filteredData.length > 0) {
    const latestDayData = filteredData.find(d => d.date === latestDay);
    if (latestDayData && latestDayData.electricity) {
      elecBaoCao = {
        e1: latestDayData.electricity.e1 || 0,
        e2: latestDayData.electricity.e2 || 0,
        hamer: latestDayData.electricity.hamer || 0,
        line: latestDayData.electricity.line || 0
      };
    }
  }
  
  const latestDateStr =`;
code = code.replace(target2, replacement2);

// 2. Modify calculateDiff to use elecBaoCao
const oldCalcDiff = `  const calculateDiff = (machine: string) => {
    const r = parseFloat((elecData as any)[machine].report) || 0;
    const m = parseFloat((elecData as any)[machine].mcc) || 0;
    if (!r && !m) return null;
    return r - m;
  };`;

const newCalcDiff = `  const calculateDiff = (machine: string) => {
    const r = (elecBaoCao as any)[machine] || 0;
    const m = parseFloat((elecData as any)[machine].mcc) || 0;
    if (!r && !m) return null;
    return r - m;
  };`;
code = code.replace(oldCalcDiff, newCalcDiff);

// 3. Modify renderElecRow to display elecBaoCao
const oldRenderRow = `        <td className="p-0 border-r border-slate-200 dark:border-slate-700">
          <input 
            type="number" 
            value={(elecData as any)[machineKey].report}
            onChange={e => handleElecInput(machineKey, 'report', e.target.value)}
            className="w-full h-full p-2 bg-transparent text-center outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
            placeholder="0"
          />
        </td>`;

const newRenderRow = `        <td className="p-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-mono font-bold text-slate-700 dark:text-slate-300">
          {(elecBaoCao as any)[machineKey] || 0}
        </td>`;
code = code.replace(oldRenderRow, newRenderRow);

fs.writeFileSync('src/components/extruder/ExtruderReportCheck.tsx', code);
console.log('Updated frontend to auto-fetch report values!');
