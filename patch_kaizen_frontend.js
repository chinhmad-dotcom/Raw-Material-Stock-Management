const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/KpiDashboard.tsx', 'utf8');

// 1. Add kaizen state
content = content.replace("const [lossData, setLossData] = useState<{month: string, val: number}[]>([]);", 
"const [lossData, setLossData] = useState<{month: string, val: number}[]>([]);\n    const [kaizenData, setKaizenData] = useState<any[]>([]);");

// 2. Add fetch logic for kaizen
content = content.replace("fetch(`http://localhost:5147/api/kpi/loss?year=${selectedYear}&_t=${ts}`)", 
"fetch(`http://localhost:5147/api/kpi/loss?year=${selectedYear}&_t=${ts}`),\n          fetch(`http://localhost:5147/api/kpi/kaizen?year=${selectedYear}&_t=${ts}`)");

content = content.replace("const [tgtRes, truckRes, elecTotRes, lossRes] = await Promise.all", 
"const [tgtRes, truckRes, elecTotRes, lossRes, kaizenRes] = await Promise.all");

content = content.replace("setLossData(lossJson.data || []);", 
"setLossData(lossJson.data || []);\n        \n        const kaizenJson = await kaizenRes.json();\n        if (kaizenJson.data) setKaizenData(kaizenJson.data);");

// 3. Add Kaizen KPI Card (Card 4)
const kaizenCard = `
          {/* Card 4: Kaizen */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Activity className="w-5 h-5 text-green-500" />
                Số lượng Kaizen
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {kaizenData.length}
                </div>
                <div className="text-sm text-slate-500 mt-1">Đề tài (Năm {selectedYear})</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <label className="text-xs text-slate-500 font-medium mb-1 uppercase">Target</label>
                <input 
                  type="number"
                  className="w-20 border border-slate-200 rounded px-2 py-1 text-right text-green-600 font-bold focus:outline-none focus:border-green-500 bg-green-50"
                  value={targets.kaizen || 10}
                  onChange={e => handleTargetChange('kaizen', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
               <span className="text-slate-500">Trạng thái:</span>
               <span className={\`font-semibold px-2 py-0.5 rounded-full \${kaizenData.length >= (targets.kaizen || 10) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                 {kaizenData.length >= (targets.kaizen || 10) ? 'ĐẠT' : 'CHƯA ĐẠT'}
               </span>
            </div>
          </div>
`;
content = content.replace("{/* Chart 1 */}", kaizenCard + "\n        </div>\n\n        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n          {/* Chart 1 */}").replace("grid-cols-1 md:grid-cols-3", "grid-cols-1 md:grid-cols-2 lg:grid-cols-4");

// 4. Add Kaizen List at the bottom of overview tab
const kaizenList = `
        {/* Kaizen List Section */}
        <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Danh sách Kaizen ({selectedYear})</h3>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
                onClick={() => {
                   const name = prompt('Nhập tên Kaizen:');
                   if (!name) return;
                   const owner = prompt('Tên người làm:');
                   const helper = prompt('Người hỗ trợ:');
                   
                   const newK = { year: selectedYear, name, owner, helper };
                   fetch('http://localhost:5147/api/kpi/kaizen', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newK)
                   }).then(r => r.json()).then(res => {
                      if (res.success) {
                         setKaizenData([...kaizenData, res.data]);
                      }
                   });
                }}
              >
                 + Thêm Kaizen
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                 <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                    <tr>
                       <th className="px-4 py-3 border-b border-slate-200">Tên Kaizen</th>
                       <th className="px-4 py-3 border-b border-slate-200">Tên người làm</th>
                       <th className="px-4 py-3 border-b border-slate-200">Người hỗ trợ</th>
                       <th className="px-4 py-3 border-b border-slate-200 w-24 text-center">Hành động</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {kaizenData.length === 0 ? (
                       <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">Chưa có dữ liệu</td></tr>
                    ) : kaizenData.map((k, i) => (
                       <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{k.name}</td>
                          <td className="px-4 py-3 text-slate-600">{k.owner}</td>
                          <td className="px-4 py-3 text-slate-600">{k.helper}</td>
                          <td className="px-4 py-3 text-center">
                             <button
                               className="text-red-500 hover:text-red-700 font-medium text-xs"
                               onClick={() => {
                                  if (!confirm('Xóa Kaizen này?')) return;
                                  fetch(\`http://localhost:5147/api/kpi/kaizen?id=\${k.id}\`, { method: 'DELETE' }).then(() => {
                                      setKaizenData(kaizenData.filter(d => d.id !== k.id));
                                  });
                               }}
                             >
                               Xóa
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
`;
content = content.replace(/<\/div>\s*<\/div>\s*\{?\/\* Chi tit ?in nng \*\//, kaizenList + "\n      </div>\n      {/* Chi tiết Điện năng */");

// Handle UTF-8 encoding issue for the replace target by just finding the correct place before the second tab
content = content.replace("</div>\n\n      {/* Tab Chi ti", kaizenList + "\n      </div>\n\n      {/* Tab Chi ti");
content = content.replace("</div>\n\n      {/* Chi tiết", kaizenList + "\n      </div>\n\n      {/* Chi tiết");
content = content.replace(/<\/div>\s*<\/div>\s*<div className=\{\`flex-col h-full \$\{activeTab === 'electricity' \? 'flex' : 'hidden'\}\`\}>/, 
    kaizenList + "\n      </div>\n      <div className={`flex-col h-full ${activeTab === 'electricity' ? 'flex' : 'hidden'}`}>");

fs.writeFileSync('frontend/src/pages/KpiDashboard.tsx', content);
console.log('patched');
