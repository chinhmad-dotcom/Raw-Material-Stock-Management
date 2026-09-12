const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/dashboard/DashboardPage.tsx', 'utf8');

// Replace store destructuring
code = code.replace(
  'const { summary, loading, error, loadDashboard } = useDashboardStore();',
  'const { summary, loading, error, availableDates, selectedDate, loadAvailableDates, setSelectedDate, loadDashboard } = useDashboardStore();'
);

// Replace useEffect
code = code.replace(
  `  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);`,
  `  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);`
);

// Add Date picker UI
code = code.replace(
  `<div className="flex flex-wrap items-center gap-4 bg-slate-950/80 border border-white/10 px-5 py-2 rounded-xl ring-1 ring-sky-500/20">`,
  `<div className="flex flex-wrap items-center gap-4 bg-slate-950/80 border border-white/10 px-5 py-2 rounded-xl ring-1 ring-sky-500/20">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold tracking-wider text-slate-300">Ngày báo cáo</label>
                <select
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-emerald-500/50 text-sm text-slate-100 rounded-md px-3 py-1 outline-none focus:border-emerald-400 cursor-pointer min-w-[120px]"
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                  {availableDates.length === 0 && <option value="">No data</option>}
                </select>
              </div>
`
);

// Also after upload, we should refresh available dates instead of just loadDashboard()
code = code.replace(
  `          setImportResult(result);\n          loadDashboard();`,
  `          setImportResult(result);\n          loadAvailableDates();`
);

fs.writeFileSync('frontend/src/components/dashboard/DashboardPage.tsx', code);
console.log('Dashboard UI updated');
