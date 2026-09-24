const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

const newTable = `<table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                     <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Chỉ số</th>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                           <th key={m} className="px-4 py-3 border-b border-slate-200 text-center">T{m}</th>
                        ))}
                        <th className="px-4 py-3 border-b border-slate-200 text-center text-indigo-700">TRUNG BÌNH</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-700">Loss (%)</td>
                        {lossData.map((d, i) => (
                           <td key={i} className="px-2 py-2 text-center">
                              <input
                                 type="number"
                                 step="0.01"
                                 className="w-20 px-2 py-1 text-center border border-slate-200 rounded text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                 value={d.val || ''}
                                 onChange={(e) => {
                                     const val = Number(e.target.value);
                                     const newData = [...lossData];
                                     newData[i].val = val;
                                     setLossData(newData);
                                     
                                     fetch('http://localhost:5147/api/kpi/loss', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ year: selectedYear, month: d.month, val: val })
                                     });
                                 }}
                              />
                           </td>
                        ))}
                        <td className="px-4 py-3 font-bold text-indigo-700 text-center text-base">
                           {avgLoss.toFixed(1)}
                        </td>
                     </tr>
                  </tbody>
               </table>`;

const regex = /<table className="w-full text-sm text-left whitespace-nowrap">[\s\S]*?<\/table>/g;
let found = 0;
content = content.replace(regex, (match) => {
    found++;
    if (found === 2) { // 2nd table is the Loss table!
        return newTable;
    }
    return match;
});

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched');
