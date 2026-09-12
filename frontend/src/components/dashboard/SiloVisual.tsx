import type { SiloDashboardCard } from '../../types/dashboard';

export function SiloVisual({ silo }: { silo: SiloDashboardCard }) {
  const statusColor = silo.isCriticalAgeAlert
    ? 'bg-rose-500'
    : silo.isLowStockAlert
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  const fillP = silo.fillPercent ?? (silo.capacityTons > 0 ? (silo.currentStockTons / silo.capacityTons) * 100 : 0);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/90 p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-600 dark:text-slate-500 dark:text-slate-400">{silo.siloCode}</p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{silo.materialName}</h3>
        </div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 ${statusColor}`}>
          {silo.isCriticalAgeAlert ? 'Critical' : silo.isLowStockAlert ? 'Low Stock' : 'Healthy'}
        </div>
      </div>
      <div className="flex items-end gap-4">
        <div className="relative h-40 w-16 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/90">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-sky-400/90"
            style={{ height: `${Math.min(100, Math.max(0, fillP))}%` }}
          />
        </div>
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
            <span>Fill</span>
            <span>{fillP.toFixed(0)}%</span>
          </div>
          <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>DOH</span>
              <span>{silo.dayOnHand.toFixed(1)}d</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Age</span>
              <span>{silo.ageInDays}d</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Capacity</span>
              <span>{silo.capacityTons.toFixed(0)}t</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

