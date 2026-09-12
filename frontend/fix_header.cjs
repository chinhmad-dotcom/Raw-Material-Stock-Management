const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');

const target1 = '        <header className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-3 sm:px-5 sm:py-3 shadow-panel backdrop-blur-xl flex flex-col gap-2 shrink-0">';
const target2 = '      </header>';

const idx1 = code.indexOf(target1);
const idx2 = code.indexOf(target2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `        <header className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-3 sm:px-5 shadow-panel backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="shrink-0">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Raw Material Stock Management</h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 flex-1">
            {/* Dropdown Lọc */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-xl ring-1 ring-sky-500/20">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">REPORT DATE</label>
                <select
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-emerald-500/50 text-xs sm:text-sm text-slate-900 dark:text-slate-100 rounded-md px-2 py-0.5 outline-none focus:border-emerald-400 cursor-pointer min-w-[120px]"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                  {availableDates.length === 0 && <option value="">No data</option>}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">MATERIAL GROUP</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSelectedMaterial('All');
                  }}
                  className="bg-white dark:bg-slate-900 border border-sky-500/50 text-xs sm:text-sm text-slate-900 dark:text-slate-100 rounded-md px-2 py-0.5 outline-none focus:border-sky-400 cursor-pointer min-w-[120px]"
                >
                  <option value="All">All</option>
                  <option value="Silo">Silo</option>
                  <option value="Additives">Additives</option>
                  <option value="Liquid">Liquid</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 z-10">
                <label className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">MATERIAL NAME</label>
                <SearchableSelect
                  value={selectedMaterial}
                  onChange={(val) => setSelectedMaterial(val)}
                  options={['All', ...allMaterialNames]}
                  className="min-w-[140px] max-w-[200px]"
                />
              </div>
            </div>

            <label className={\`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition \${importing ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'}\`}>
              <input type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={handleFileChange} disabled={importing} />
              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                {importing ? 'Reading Excel...' : (selectedFile?.name ?? 'Choose Excel file')}
              </span>
            </label>
          </div>
        </header>`;

  code = code.substring(0, idx1) + replacement + code.substring(idx2 + target2.length);
  fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', code, 'utf8');
  console.log('Fixed header successfully');
} else {
  console.log('Targets not found', idx1, idx2);
}
