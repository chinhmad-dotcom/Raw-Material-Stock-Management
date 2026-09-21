import React from 'react';
import FumigationReport from '../components/reports/FumigationReport';
import { UserMenu } from '../components/layout/UserMenu';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FumigationReportPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-50">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Báo cáo phun trùng</h1>
        </div>
        <div className="flex-1 flex justify-end shrink-0">
           <UserMenu />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-transparent">
         <FumigationReport />
      </div>
    </div>
  );
}
