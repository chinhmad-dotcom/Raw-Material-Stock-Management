const fs = require('fs');

let code = fs.readFileSync('src/components/extruder/ExtruderReportCheck.tsx', 'utf8');

// 1. Add state for elecData
const stateInjection = `
  const [elecData, setElecData] = useState({
    e1: { report: '', mcc: '' },
    e2: { report: '', mcc: '' },
    hamer: { report: '', mcc: '' },
    line: { report: '', mcc: '' }
  });

  useEffect(() => {
    const savedElec = localStorage.getItem('extruderElecComparison');
    if (savedElec) {
      try { setElecData(JSON.parse(savedElec)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('extruderElecComparison', JSON.stringify(elecData));
  }, [elecData]);

  const handleElecInput = (machine: string, field: 'report'|'mcc', val: string) => {
    setElecData(prev => ({
      ...prev,
      [machine]: {
        ...prev[machine as any],
        [field]: val
      }
    }));
  };

  const calculateDiff = (machine: string) => {
    const r = parseFloat((elecData as any)[machine].report) || 0;
    const m = parseFloat((elecData as any)[machine].mcc) || 0;
    if (!r && !m) return null;
    return r - m;
  };

  const renderElecRow = (machineKey: string, machineName: string) => {
    const diff = calculateDiff(machineKey);
    const isError = diff !== null && Math.abs(diff) > 0;
    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="p-2 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
          {machineName}
        </td>
        <td className="p-0 border-r border-slate-200 dark:border-slate-700">
          <input 
            type="number" 
            value={(elecData as any)[machineKey].report}
            onChange={e => handleElecInput(machineKey, 'report', e.target.value)}
            className="w-full h-full p-2 bg-transparent text-center outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
            placeholder="0"
          />
        </td>
        <td className="p-0 border-r border-slate-200 dark:border-slate-700">
          <input 
            type="number" 
            value={(elecData as any)[machineKey].mcc}
            onChange={e => handleElecInput(machineKey, 'mcc', e.target.value)}
            className="w-full h-full p-2 bg-transparent text-center outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
            placeholder="0"
          />
        </td>
        <td className="p-2 font-mono font-bold">
          {diff === null ? '-' : (
            <span className={isError ? 'text-rose-500' : 'text-emerald-500'}>
              {diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </td>
      </tr>
    );
  };
`;

code = code.replace('const handleInput = (setFn:', stateInjection + '\n  const handleInput = (setFn:');

// 2. Add table to UI
// Look for the end of the warnings table section:
//           )}
//         </div>
//       </div>
// 
//       {/* Right side: Comparison Table */}
const tableInjection = `
          )}
        </div>

        {/* Bảng so sánh số điện */}
        <div className="shrink-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4">
           <div className="bg-slate-100 dark:bg-slate-800 p-2.5 border-b border-slate-200 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-500" /> So sánh số điện
             </h3>
           </div>
           <table className="w-full text-center text-sm">
             <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
               <tr>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-left w-1/3">Thiết bị</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Báo cáo</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Thực tế MCC</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Chênh lệch</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {renderElecRow('e1', 'Extruder bắp E1')}
                {renderElecRow('e2', 'Extruder nành E2')}
                {renderElecRow('hamer', 'Hamer')}
                {renderElecRow('line', 'Line')}
             </tbody>
           </table>
        </div>
      </div>
`;

code = code.replace(/\{\s*\/\* Right side: Comparison Table \*\/\s*\}/, (match) => {
    return '</div>\n' + match; // We actually need to replace the closing tags correctly
});

// Wait, the regex replacement is risky if I don't get the exact closing tags.
// Let's do a more precise string replace:
const targetString = `          )}
        </div>
      </div>

      {/* Right side: Comparison Table */}`;

code = code.replace(targetString, tableInjection + '\n      {/* Right side: Comparison Table */}');

fs.writeFileSync('src/components/extruder/ExtruderReportCheck.tsx', code);
console.log('Added electricity comparison table');
