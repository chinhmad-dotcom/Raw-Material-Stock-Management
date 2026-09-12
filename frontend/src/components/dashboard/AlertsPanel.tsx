import type { AlertCard } from '../../types/dashboard';

export function AlertsPanel({ alerts }: { alerts: AlertCard[] }) {
  // Filter alerts: display all alerts from the server since the server handles the thresholds
  const displayAlerts = alerts;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 sm:p-3 shadow-panel flex flex-col h-full min-h-0">
      <div className="mb-1 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
          ALERTS ({displayAlerts.length})
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {displayAlerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
              No critical alerts found.
            </div>
          ) : (
            displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-xl border transition-colors hover:bg-opacity-50 ${
                  alert.alertType === 'CriticalAge'
                    ? 'border-rose-500/20 bg-rose-500/10'
                    : 'border-amber-500/20 bg-amber-500/10'
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[70%]">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={alert.materialName}>
                    {alert.materialName} {alert.location && <span className="text-sky-400 font-bold ml-1">({alert.location})</span>}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate" title={alert.message}>
                    {alert.alertType === 'CriticalAge'
                      ? `Over age: ${alert.currentValue}d`
                      : `Low DOH: ${(alert.currentValue ?? 0).toFixed(1)}d`}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${
                    alert.alertType === 'CriticalAge' ? 'text-rose-400 bg-rose-500/20' : 'text-amber-400 bg-amber-500/20'
                  }`}
                >
                  {alert.alertType === 'CriticalAge' ? 'Critical' : 'Warning'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

