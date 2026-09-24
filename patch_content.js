const fs = require('fs');

const lossTabContent = `
      <div className={\`flex-col h-full \${activeTab === 'loss' ? 'flex' : 'hidden'}\`}>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden mb-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                   <Activity className="w-5 h-5 text-indigo-500" />
                   Nhập liệu Loss hàng tháng (%)
               </div>
            </h3>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                     <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Month</th>
                        <th className="px-4 py-3 border-b border-slate-200">Loss (%)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {lossData.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-600">Tháng {d.month}</td>
                            <td className="px-4 py-3">
                               <input
                                  type="number"
                                  step="0.01"
                                  className="w-32 px-3 py-1.5 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
        </div>
      </div>
`;

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, "</div>\n      </div>\n" + lossTabContent + "\n    </div>\n  );\n}");
fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
