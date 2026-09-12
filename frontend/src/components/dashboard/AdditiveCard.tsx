import type { AdditiveDashboardCard } from '../../types/dashboard';
import { Thermometer, CalendarDays, Warehouse } from 'lucide-react';

export function AdditiveCard({ additive }: { additive: AdditiveDashboardCard }) {
  const status = additive.isCriticalAgeAlert ? 'CRITICAL' : additive.isLowStockAlert ? 'LOW STOCK' : 'STABLE';
  const barColor = additive.isCriticalAgeAlert ? 'bg-rose-500' : additive.isLowStockAlert ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/90 p-5 shadow-panel transition hover:-translate-y-0.5 duration-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{additive.materialCode}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{additive.materialName}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 ${barColor}`}>
          {status}
        </span>
      </div>
      <div className="mb-4 grid gap-3 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-slate-500 dark:text-slate-400" /> <span>DOH {additive.dayOnHand.toFixed(1)} days</span></div>
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400" /> <span>Age {additive.ageInDays} / {additive.maxStorageAgeDays} days</span></div>
        <div className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-slate-500 dark:text-slate-400" /> <span>{additive.warehouseLocation ?? 'Warehouse'}</span></div>
      </div>
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-950/70 p-3 text-sm text-slate-700 dark:text-slate-300">
        <div className="mb-2 flex items-center justify-between">
          <span>Coverage</span>
          <span>{Math.min(999, additive.dayOnHand).toFixed(1)}d</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, (additive.dayOnHand / 30) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}


