const fs = require('fs');
let code = fs.readFileSync('src/components/extruder/ExtruderReportCheck.tsx', 'utf8');

const oldRenderRow = `        <td className="p-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-mono font-bold text-slate-700 dark:text-slate-300">
          {(elecBaoCao as any)[machineKey] || 0}
        </td>`;

const newRenderRow = `        <td className="p-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-mono font-bold text-slate-700 dark:text-slate-300">
          {Math.round((elecBaoCao as any)[machineKey] || 0)}
        </td>`;

code = code.replace(oldRenderRow, newRenderRow);

const oldDiffRender = `              {diff > 0 ? '+' : ''}{diff}
            </span>`;

const newDiffRender = `              {diff > 0 ? '+' : ''}{Math.round(diff)}
            </span>`;

code = code.replace(oldDiffRender, newDiffRender);

fs.writeFileSync('src/components/extruder/ExtruderReportCheck.tsx', code);
console.log('Patched frontend to round consumption');
