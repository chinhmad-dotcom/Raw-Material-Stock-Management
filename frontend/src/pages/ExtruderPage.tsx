import { UserMenu } from '../components/layout/UserMenu';
﻿import React, { useState, useRef } from 'react';
import { Activity, BarChart2, ShieldCheck, Factory, UploadCloud, Loader2 } from 'lucide-react';
import ExtruderProduction from '../components/extruder/ExtruderProduction';
import ExtruderOEE from '../components/extruder/ExtruderOEE';
import ExtruderReportCheck from '../components/extruder/ExtruderReportCheck';
import { uploadExtruderReport } from '../api/extruderApi';
import { useAuthStore } from '../features/auth/store/authStore';



export default function ExtruderPage() {
  const [activeTab, setActiveTab] = useState<'production' | 'oee' | 'check'>('production');
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore(state => state.user);
  const userRole = user?.role;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadExtruderReport(file);
      setRefreshKey(prev => prev + 1);
      alert('Report uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans rounded-tl-2xl shadow-inner border-t border-l border-white/50 dark:border-white/10 relative">
      
      {/* Header Extruder */}
      <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm shrink-0 flex flex-col md:flex-row items-center gap-3 relative z-50">
        
        {/* Left Section (Logo & Title) */}
        <div className="flex-1 flex items-center justify-start gap-3 w-full md:w-auto">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center shadow-inner shrink-0">
            <Factory className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight leading-tight">Extruder Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Monitor Output & OEE</p>
          </div>
        </div>

        {/* Center Section (Tab Navigation and Upload Button) */}
        <div className="flex-1 flex flex-row justify-center items-center gap-3 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {/* Tabs */}
          <div className="flex bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('production')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === 'production' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Output
            </button>
            
            <button
              onClick={() => setActiveTab('oee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                activeTab === 'oee' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> OEE
            </button>

            <button
              onClick={() => setActiveTab('check')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                activeTab === 'check' 
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Report Audit
            </button>
          </div>

          {/* Upload Button */}
          {userRole?.toLowerCase() !== 'viewer' && (
            <div className="flex items-center shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />} Upload Report</button>
            </div>
          )}
        </div>

        {/* Right Section (Empty Space for Fixed UserMenu) */}
        <div className="flex-1 hidden md:flex justify-end"><UserMenu /></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        <div className="w-full h-full">
          {activeTab === 'production' && <ExtruderProduction key={`prod-${refreshKey}`} />}
          {activeTab === 'oee' && <ExtruderOEE />}
          {activeTab === 'check' && <ExtruderReportCheck />}
        </div>
      </div>

    </div>
  );
}


