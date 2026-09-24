const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Rename targets and add activeTab
content = content.replace(/elecExtruder: 220/g, 'loss: 1.5');
content = content.replace(/targets\.elecExtruder/g, 'targets.loss');
// Not touching truck and elecReceive to avoid regex issues

// 2. Add loss tab
content = content.replace(/'overview' \| 'electricity'>\('overview'\);/, "'overview' | 'electricity' | 'loss'>('overview');");

// Tabs markup
content = content.replace(/<\/button>\s*<\/div>/, `</button>
        <button
          className={\`px-6 py-3 font-medium text-sm transition-colors border-b-2 \${activeTab === 'loss' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
          onClick={() => setActiveTab('loss')}
        >
          Nhập liệu Loss
        </button>
      </div>`);

// 3. Replace state and fetch logic
content = content.replace(/const \[elecExtruderData, setElecExtruderData\] = useState<any\[\]>\(\[\]\);/, "const [lossData, setLossData] = useState<any[]>([]);");

// Replace fetch array
content = content.replace(/fetch\(\`http:\/\/localhost:5147\/api\/extruder\/production\?year=\$\{selectedYear\}&_t=\$\{ts\}\`\)/, "fetch(`http://localhost:5147/api/kpi/loss?year=${selectedYear}&_t=${ts}`)");

content = content.replace(/const elecExtRes = await responses\[3\];/, "const lossRes = await responses[3];");
// Actually it is: const [tgtRes, truckRes, elecTotRes, elecExtRes] = await Promise.all([
content = content.replace(/elecExtRes/g, "lossRes");

// Replace JSON
content = content.replace(/const elecExtJson = await lossRes\.json\(\);/, "const lossJson = await lossRes.json();");
content = content.replace(/setElecExtruderData\(elecExtJson\.data \|\| \[\]\);/, "setLossData(lossJson.data || []);");

// 4. Update avg calculations
content = content.replace(/const avgElecExtruder = useMemo\(\(\) => \{[\s\S]*?\}, \[elecExtruderData\]\);/, `const avgLoss = useMemo(() => {
    const valid = lossData.filter(d => d.val > 0);
    return valid.length ? valid.reduce((s, d) => s + d.val, 0) / valid.length : 0;
  }, [lossData]);`);

// 5. Replace Card 3
content = content.replace(/Chi phí điện Extruder/g, "Kiểm soát Loss");
content = content.replace(/avgElecExtruder/g, "avgLoss");
content = content.replace(/KWH\/TON \(Trung bình năm\)/, "% (Trung bình năm)");
content = content.replace(/elecExtruder/g, "loss");

// 6. Replace Chart 3
content = content.replace(/Điện Extruder \(KWH\/Tons\)/, "Kiểm soát Loss (%)");
content = content.replace(/data=\{elecExtruderData\}/, "data={lossData}");

// 7. Add Loss Tab content
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

content = content.replace("</div>\n    </div>\n  );\n}", lossTabContent + "\n    </div>\n  );\n}");

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched frontend');
