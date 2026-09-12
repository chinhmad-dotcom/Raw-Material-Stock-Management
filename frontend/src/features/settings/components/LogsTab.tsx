import { useTranslation } from 'react-i18next';
﻿import { useState, useEffect } from 'react';
import { Loader2, TerminalSquare } from 'lucide-react';

interface Log {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  successCount: number;
  errorCount: number;
}

export function LogsTab() {
  const { t } = useTranslation();


  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5147/api/settings/logs')
      .then(res => res.json())
      .then(data => { setLogs(data); setIsLoading(false); })
      .catch(console.error);
  }, []);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-black p-4 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,1)] ring-1 ring-white/5">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <TerminalSquare className="h-5 w-5 text-emerald-500" />
        <h2 className="text-sm font-semibold text-emerald-500">{t('tabs.logs.title', 'SYSTEM AUDIT & MAIL LOGS')}</h2>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>{t('tabs.logs.live', 'Live Stream')}</div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar text-xs">
        <div className="flex flex-col gap-1.5 p-2">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded transition-colors">
              <span className="text-slate-500 dark:text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={`shrink-0 w-24 ${log.type === 'Mail_Scan' ? 'text-sky-400' : 'text-fuchsia-400'}`}>[{log.type}]</span>
              <span className="text-emerald-400 flex-1">{log.message}</span>
              <span className="text-emerald-500 shrink-0">+{log.successCount} lines</span>
              {log.errorCount > 0 && <span className="text-rose-500 shrink-0">-{log.errorCount} errors</span>}
            </div>
          ))}
          <div className="text-slate-600 animate-pulse mt-2">{t('tabs.logs.waiting', '_waiting for incoming signals...')}</div>
        </div>
      </div>
    </div>
  );
}



