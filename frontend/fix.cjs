const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/DashboardPage.tsx', 'utf8');

const target1 = '<label className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">REPORT DATE</label>';
const target2 = '            icon={<Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />}';

const idx1 = code.indexOf(target1);
const idx2 = code.indexOf(target2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `${target1}
                <select
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-emerald-500/50 text-sm text-slate-900 dark:text-slate-100 rounded-md px-3 py-1 outline-none focus:border-emerald-400 cursor-pointer min-w-[120px]"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                  {availableDates.length === 0 && <option value="">No data</option>}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">MATERIAL GROUP</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSelectedMaterial('All');
                  }}
                  className="bg-white dark:bg-slate-900 border border-sky-500/50 text-sm text-slate-900 dark:text-slate-100 rounded-md px-3 py-1 outline-none focus:border-sky-400 cursor-pointer min-w-[120px]"
                >
                  <option value="All">All</option>
                  <option value="Silo">Silo</option>
                  <option value="Additives">Additives</option>
                  <option value="Liquid">Liquid</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 z-10">
                <label className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">MATERIAL NAME</label>
                <SearchableSelect
                  value={selectedMaterial}
                  onChange={(val) => setSelectedMaterial(val)}
                  options={['All', ...allMaterialNames]}
                  className="min-w-[160px] max-w-[220px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className={\`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition \${importing ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'}\`}>
              <input type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={handleFileChange} disabled={importing} />
              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                {importing ? 'Reading Excel...' : (selectedFile?.name ?? 'Choose Excel file')}
              </span>
            </label>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-200 shrink-0">
          <p className="font-medium">Unable to load dashboard</p>
          <p className="mt-2 text-sm text-rose-100">{error}</p>
        </div>
      )}

      <section className="flex flex-col gap-2 flex-1 min-h-0">
        {/* Top 6 Stats Cards */}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 shrink-0">
          <Card 
            icon={<Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} 
            label="Total Volume" 
            value={formatTons(totalStockVolumeTons)} 
          />
          <Card 
${target2}`;

  code = code.substring(0, idx1) + replacement + code.substring(idx2 + target2.length);
  fs.writeFileSync('src/components/dashboard/DashboardPage.tsx', code, 'utf8');
  console.log('Fixed successfully');
} else {
  console.log('Targets not found', idx1, idx2);
}
