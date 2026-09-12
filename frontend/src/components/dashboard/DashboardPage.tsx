import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { Activity, AlertTriangle, Layers, Zap, User, LogOut, Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Link } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useThemeStore } from '../../store/themeStore';
import { uploadAdditiveStockExcel, uploadSiloStockExcel } from '../../api/import';
import type { ExcelImportResult } from '../../types/import';
import { AdditiveCard } from './AdditiveCard';
import { TopImportedMaterials } from './TopImportedMaterials';
import { AlertsPanel } from './AlertsPanel';
import { SearchableSelect } from './SearchableSelect';
import { UserMenu } from '../layout/UserMenu';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { summary, loading, error, availableDates, selectedDate, loadAvailableDates, setSelectedDate, loadDashboard } = useDashboardStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // Filters state
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');

  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  // Combine all items from silos and additives
  const allItems = [
    ...(summary?.silos ?? []),
    ...(summary?.additives ?? [])
  ];

  // Materials list according to selected group
  const materialsInGroup = allItems.filter((item) => {
    let ig = (item as any).groupType;
    if (ig === 'Phụ gia') ig = 'Additives';
    return selectedGroup === 'All' || ig === selectedGroup;
  });

  const allMaterialNames = Array.from(
    new Set(materialsInGroup.map((i) => i.materialName))
  ).filter(Boolean);

  // Filtered items based on group and material selection
  const filteredItems = allItems.filter((item) => {
    let itemGroup = (item as any).groupType || ('siloCode' in item ? 'Silo' : 'Additives');
      if (itemGroup === 'Phụ gia') itemGroup = 'Additives';
    const matchGroup = selectedGroup === 'All' || itemGroup === selectedGroup;
    const matchMaterial = selectedMaterial === 'All' || item.materialName === selectedMaterial;
    return matchGroup && matchMaterial;
  });

  const filteredSilos = filteredItems.filter((item) => 'siloCode' in item && ((item as any).groupType === 'Silo' || !(item as any).groupType));
  const filteredAdditives = filteredItems.filter((item) => !('siloCode' in item) || ((item as any).groupType && (item as any).groupType !== 'Silo'));

  // Filter materials summary for accurate total aggregations
  const filteredMaterials = (summary?.materials ?? []).filter((item: any) => {
    let itemGroup = item.groupType || 'Additives';
    if (itemGroup === 'Phụ gia') itemGroup = 'Additives';
    const matchGroup = selectedGroup === 'All' || itemGroup === selectedGroup;
    const matchMaterial = selectedMaterial === 'All' || item.materialName === selectedMaterial;
    return matchGroup && matchMaterial;
  });

  const validMaterialNamesForAlerts = new Set(filteredItems.map(i => i.materialName));
  const filteredAlerts = (summary?.activeAlerts ?? []).filter((alert: any) => 
    (selectedGroup === 'All' && selectedMaterial === 'All') ? true : validMaterialNamesForAlerts.has(alert.materialName)
  );

  // Calculated totals for top summary cards
  
  const top10UsageData = [...filteredMaterials]
    .sort((a: any, b: any) => (b.actualUsageKg || 0) - (a.actualUsageKg || 0))
    .slice(0, 10)
    .map((mat: any) => ({
      name: mat.materialName,
      usage: Math.round((mat.actualUsageKg || 0) / 1000)
    }));
  const totalStockVolumeTons = [...filteredSilos, ...filteredAdditives].reduce((acc: any, i: any) => acc + (i.currentStockTons || 0), 0);
  const totalEstUsageDayKg = filteredMaterials.reduce((acc: any, i: any) => acc + (i.estUsageKg || 0), 0);
  const totalEstUsageWeekKg = totalEstUsageDayKg * 6;
  const totalActualUsageKg = filteredMaterials.reduce((acc: any, i: any) => acc + (i.actualUsageKg || 0), 0);
  const totalTodayReceiveTons = filteredMaterials.reduce((acc: any, i: any) => acc + ((i.totalReceiveKg || 0) / 1000), 0);

  // Calculate DOH
  const estUsageDayTons = totalEstUsageDayKg / 1000;
  const averageDOH = estUsageDayTons > 0 ? (totalStockVolumeTons / estUsageDayTons) : 0;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
    setImportError(null);

    if (file) {
      setImporting(true);
      try {
        const result = await uploadSiloStockExcel(file);
        setImportResult(result);
        await loadAvailableDates();
        alert(`Upload successful!\nLoaded ${result.succeededRows}/${result.totalRows} rows.`);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Import failed.');
        alert(`Invalid file format: ${error instanceof Error ? error.message : 'Import failed.'}`);
      } finally {
        setImporting(false);
      }
    }
  };

  const groupedMaterialsList = filteredMaterials.map((mat: any) => {
    const locationsList = [...filteredSilos, ...filteredAdditives]
       .filter((item: any) => item.materialName === mat.materialName && item.currentStockTons > 0);
       
    const locationStr = Array.from(new Set(locationsList.map((item: any) => 'siloCode' in item ? item.siloCode : item.warehouseLocation))).filter(Boolean).join(', ');
    
    // Lấy tồn kho trực tiếp từ dòng Total trong Excel (nếu có), nếu không có mới tự cộng dồn
    const stock = mat.totalStockTons > 0 
      ? mat.totalStockTons 
      : locationsList.reduce((acc, item) => acc + (item.currentStockTons || 0), 0);
      
    const est = (mat.estUsageKg || 0) / 1000;
    const actualUsage = (mat.actualUsageKg || 0) / 1000;
    const usageForDoh = est > 0 ? est : actualUsage;
    
    let doh = mat.dohDay || 0;
    if (doh === 0) {
      doh = usageForDoh > 0 ? stock / usageForDoh : 0;
      if (doh === 0 && locationsList.length > 0) {
        doh = locationsList.reduce((acc, item) => Math.max(acc, item.dayOnHand || 0), 0);
      }
    }
    
    const receive = (mat.totalReceiveKg || 0) / 1000;

    return {
       name: mat.materialName,
       location: locationStr || 'N/A',
       stock: stock,
       receive: receive,
       est: est,
       doh: doh
      };
    }).filter((a: any) => a.stock > 0).sort((a: any, b: any) => b.stock - a.stock);

    return (
      <div className="mx-auto flex h-screen max-w-full flex-col gap-1 px-1 py-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <header className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 sm:px-3  shadow-panel backdrop-blur-xl flex flex-col xl:flex-row items-center justify-between gap-2 shrink-0 min-h-[60px] relative z-50">
          <div className="shrink-0 w-full xl:w-auto text-center xl:text-left mr-auto">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Raw Material Stock Management</h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 z-10 flex-1">
            {/* Dropdown Lọc */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-xl ring-1 ring-sky-500/20">
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

            <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${importing ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}>
              <input type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={handleFileChange} disabled={importing} />
              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                {importing ? 'Reading Excel...' : (selectedFile?.name ?? 'Choose Excel file')}
              </span>
            </label>
            <UserMenu />
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
        <div className="grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 shrink-0">
          <Card 
            icon={<Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} 
            label="Total Volume" 
            value={formatTons(totalStockVolumeTons)} 
          />
          <Card 
            icon={<Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />} 
            label="EST. Usage (Day)" 
            value={formatTons(totalEstUsageDayKg / 1000)} 
          />
          <Card 
            icon={<Activity className="h-5 w-5 text-teal-400" />} 
            label="EST. Usage (Week)" 
            value={formatTons(totalEstUsageWeekKg / 1000)} 
          />
          <Card 
            icon={<Zap className="h-5 w-5 text-amber-400" />} 
            label="Actual Usage" 
            value={formatTons(totalActualUsageKg / 1000)} 
          />
          <Card 
            icon={<AlertTriangle className="h-5 w-5 text-fuchsia-400" />} 
            label="DOH" 
            value={averageDOH > 0 ? `${averageDOH.toFixed(1)} d` : '--'} 
          />
          <Card 
            icon={<Layers className="h-5 w-5 text-indigo-400" />} 
            label="Today Received" 
            value={formatTons(totalTodayReceiveTons)} 
          />
        </div>

        <div className="grid gap-1 lg:grid-cols-[6fr_4fr] xl:grid-cols-[6.5fr_3.5fr] flex-[1.4] min-h-0">
          <div className="flex flex-col min-h-0">
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 sm:p-3 shadow-panel flex flex-col h-full min-h-0">
              <div className="mb-1 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  RAW MATERIAL DETAILS ({selectedGroup !== 'All' ? selectedGroup : 'All'})
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <table className="w-full text-left text-base">
                  <thead className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                    <tr className="border-b border-slate-700/50 text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider font-bold">
                      <th className="py-1 font-bold">Material</th>
                      <th className="py-1 font-bold">Location</th>
                      <th className="py-1 pr-4 font-bold text-right">Received Day</th>
                      <th className="py-1 pr-4 font-bold text-right">Amount</th>
                      <th className="py-1 pr-4 font-bold text-right">Est. Day</th>
                      <th className="py-1 pr-4 font-bold text-right">DOH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-900 dark:text-slate-100">
                    {groupedMaterialsList.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-200 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-1.5 font-medium break-words max-w-[140px] sm:max-w-[200px]">{item.name}</td>
                        <td className="py-1.5 text-sm text-slate-700 dark:text-slate-300 break-words max-w-[140px] sm:max-w-[220px]">{item.location}</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-emerald-600 dark:text-emerald-400">{item.receive !== 0 ? item.receive.toFixed(1) + ' t' : '--'}</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-sky-600 dark:text-sky-400">{item.stock.toFixed(1)} t</td>
                        <td className="py-1.5 pr-4 text-right font-mono">{item.est.toFixed(1)} t</td>
                        <td className="py-1.5 pr-4 text-right font-mono">{item.doh > 0 ? item.doh.toFixed(1) : '--'}</td>
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

        <div className="flex-1 min-h-0">
          <TopImportedMaterials />
        </div>
      </section>

      {loading && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 text-slate-700 dark:text-slate-300 shadow-panel">
          Loading dashboard content...
        </div>
      )}
    </div>
  );
}

function Card({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-1.5 sm:p-2 shadow-panel flex flex-row items-center justify-between transition hover:border-slate-400/20 gap-1.5 min-h-[48px]">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden shrink">
        <div className="rounded-lg bg-slate-200 dark:bg-slate-800/90 p-1.5 text-slate-800 dark:text-slate-200 shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px]">{icon}</div>
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">{label}</p>
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg font-mono text-right whitespace-nowrap shrink-0">{value}</p>
    </div>
  );
}

function formatTons(num: number): string {
  if (isNaN(num) || num === 0) return '0 T';
  return `${Math.round(num).toLocaleString()} T`;
}













