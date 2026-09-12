const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');

const target1 = '        <div className="grid gap-2 lg:grid-cols-[6fr_4fr] xl:grid-cols-[6.5fr_3.5fr]">';
const target2 = '                <div className="mt-4 h-[550px]">';

const idx1 = code.indexOf(target1);
const idx2 = code.indexOf(target2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `        <div className="grid gap-2 lg:grid-cols-[6fr_4fr] xl:grid-cols-[6.5fr_3.5fr] flex-[1.2] min-h-0">
          <div className="flex flex-col min-h-0">
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-panel flex flex-col h-full min-h-0">
              <div className="mb-2 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  RAW MATERIAL DETAILS ({selectedGroup !== 'All' ? selectedGroup : 'All'})
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <table className="w-full text-left text-base">
                  <thead className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                    <tr className="border-b border-slate-700/50 text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider font-bold">
                      <th className="py-2 font-bold">Material</th>
                      <th className="py-2 font-bold">Location</th>
                      <th className="py-2 pr-4 font-bold text-right">Received Day</th>
                      <th className="py-2 pr-4 font-bold text-right">Amount</th>
                      <th className="py-2 pr-4 font-bold text-right">Est. Day</th>
                      <th className="py-2 pr-4 font-bold text-right">DOH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-900 dark:text-slate-100">
                    {groupedMaterialsList.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-200 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-medium break-words max-w-[140px] sm:max-w-[200px]">{item.name}</td>
                        <td className="py-2.5 text-sm text-slate-700 dark:text-slate-300 break-words max-w-[140px] sm:max-w-[220px]">{item.location}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-emerald-600 dark:text-emerald-400">{item.receive !== 0 ? item.receive.toFixed(1) + ' t' : '--'}</td>
                        <td className="py-2.5 pr-4 text-right font-mono text-sky-600 dark:text-sky-400">{item.stock.toFixed(1)} t</td>
                        <td className="py-2.5 pr-4 text-right font-mono">{item.est.toFixed(1)} t</td>
                        <td className="py-2.5 pr-4 text-right font-mono">{item.doh > 0 ? item.doh.toFixed(1) : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <AlertsPanel alerts={filteredAlerts} />
          </div>
        </div>

        <div className="flex-1 min-h-0">`;

  code = code.substring(0, idx1) + replacement + code.substring(idx2 + target2.length);
  fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', code, 'utf8');
  console.log('Fixed middle successfully');
} else {
  console.log('Targets not found', idx1, idx2);
}
