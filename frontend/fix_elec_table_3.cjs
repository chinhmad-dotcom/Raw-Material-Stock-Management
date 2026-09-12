const fs = require('fs');
let code = fs.readFileSync('src/components/extruder/ExtruderReportCheck.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

const brokenPart = ")}\n        </div>\n      </div>\n\n      </div>\n{/* Right side:";

const tableInjection = `)}\n        </div>\n
        {/* Bảng so sánh số điện */}
        <div className="shrink-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4 mb-2">
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
      </div>\n\n      {/* Right side:`;

code = code.replace(brokenPart, tableInjection);
fs.writeFileSync('src/components/extruder/ExtruderReportCheck.tsx', code);
console.log('Done!');
