import React, { useState } from 'react';
import FanPlanForm from '../components/fans/FanPlanForm';
import FanPlanList from '../components/fans/FanPlanList';
import FumigationReport from '../components/reports/FumigationReport';
import { UserMenu } from '../components/layout/UserMenu';
import { FileText, Fan, ShieldAlert } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'fans' | 'fumigation'>('fans');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-50">
        
        {/* Left Side */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t('pages.reports.title', 'Hệ Thống Báo Cáo')}</h1>
        </div>

        {/* Center: Tabs */}
        <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('fans')} 
            className={'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ' + (activeTab === 'fans' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700')}
          >
            <Fan className="w-4 h-4" /> <span>Báo cáo mở quạt</span>
          </button>
          <button 
            onClick={() => setActiveTab('fumigation')} 
            className={'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ' + (activeTab === 'fumigation' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700')}
          >
            <ShieldAlert className="w-4 h-4" /> <span>Báo cáo phun trùng</span>
          </button>
        </nav>

        {/* Right Side */}
        <div className="flex-1 flex justify-end shrink-0">
           <UserMenu />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-transparent">
        {activeTab === 'fans' && (
          <div className="space-y-6">
            <FanPlanForm onSuccess={handleFormSuccess} />
            <FanPlanList key={refreshKey} />
          </div>
        )}
        {activeTab === 'fumigation' && (
          <FumigationReport />
        )}
      </div>

    </div>
  );
}
