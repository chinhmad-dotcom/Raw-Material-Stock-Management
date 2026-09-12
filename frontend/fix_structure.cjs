const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/TopImportedMaterials.tsx', 'utf8');

const replacement = `  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-3 shadow-panel flex flex-col h-full min-h-0">
      {/* Header Area: Titles and Filters */}
      <div className="mb-2 flex flex-col xl:flex-row items-center justify-between gap-3 shrink-0">
        <div className="hidden xl:block flex-1 text-center">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Receive Analysis</h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <div className="w-[200px]">
            <SearchableSelect 
               options={options} 
               value={selectedMaterial} 
               onChange={setSelectedMaterial} 
               placeholder="Search material..."
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-0.5 text-xs border border-slate-300 dark:border-sky-500/50 hover:border-sky-400">
            <span className="text-slate-500 dark:text-slate-400">From</span>
            <input 
               type="date" 
               value={startDate} 
               onChange={e => setStartDate(e.target.value)}
               className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-0.5 text-xs border border-slate-300 dark:border-sky-500/50 hover:border-sky-400">
            <span className="text-slate-500 dark:text-slate-400">To</span>
            <input 
               type="date" 
               value={endDate} 
               onChange={e => setEndDate(e.target.value)}
               className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            />
          </div>
        </div>

        <div className="hidden xl:block flex-1 text-center">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Used Analysis</h2>
        </div>
      </div>
      
      {/* Charts Side By Side */}
      <div className="flex-1 min-h-0 relative grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {/* Receive Analysis Chart */}
        <div className="flex flex-col h-full min-h-0">
          <div className="xl:hidden mb-1 text-center shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Receive Analysis</h2>
          </div>
          <div className="flex-1 min-h-0">
            {top10Receive.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                No receive data found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Receive} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} horizontal={true} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip wrapperStyle={{ background: '#0f172a', borderRadius: 12, borderColor: 'rgba(148,163,184,0.18)' }} formatter={(value: number) => [\`\${value} t\`, 'Received']} />
                    <Bar dataKey="importAmount" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Received (t)" barSize={40}>
                      <LabelList dataKey="importAmount" position="top" fill="#94a3b8" fontSize={11} formatter={(val) => val > 0 ? val : ""} />
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Used Analysis Chart */}
        <div className="flex flex-col h-full border-t border-slate-200 dark:border-white/10 pt-4 xl:pt-0 xl:border-t-0 xl:border-l xl:pl-4">
          <div className="xl:hidden mb-1 text-center shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Used Analysis</h2>
          </div>
          <div className="flex-1 min-h-0">
            {top10Usage.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                No usage data found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Usage} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" vertical={false} horizontal={true} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip wrapperStyle={{ background: '#0f172a', borderRadius: 12, borderColor: 'rgba(148,163,184,0.18)' }} formatter={(value: number) => [\`\${value} t\`, 'Used']} />
                    <Bar dataKey="usage" fill="#10b981" radius={[4, 4, 0, 0]} name="Used (t)" barSize={40}>
                      <LabelList dataKey="usage" position="top" fill="#94a3b8" fontSize={11} formatter={(val) => val > 0 ? val : ""} />
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;

const startMarker = '  return (';
const idxStart = code.indexOf(startMarker);
if (idxStart !== -1) {
  code = code.substring(0, idxStart) + replacement;
  fs.writeFileSync('src/components/dashboard/TopImportedMaterials.tsx', code, 'utf8');
  console.log('Fixed structure successfully');
}
