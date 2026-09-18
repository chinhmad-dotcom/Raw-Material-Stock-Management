import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertTriangle, ArrowRight, Loader2, Calendar, Target, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/apiClient';
import QueueKPI from './QueueKPI';

interface QueueReportItem {
  no: number;
  licensePlate: string;
  vendor: string;
  material: string;
  originalWeight: number;
  netWeight: number;
  diff: number;
  pctDiff: number;
  arrive: string;
  weight1: string;
  weight2: string;
  timing: string;
}

import { UserMenu } from '../layout/UserMenu';

export default function QueueDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<QueueReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(() => new Date().getMonth() + 1);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [yearlyKPI, setYearlyKPI] = useState<number>(0);
  
  const [targetKPI, setTargetKPI] = useState<number>(() => {
    const saved = localStorage.getItem('queueTargetKPI');
    return saved ? parseFloat(saved) : 95.5;
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetKPI.toString());

  const handleTargetSubmit = () => {
    let val = parseFloat(tempTarget);
    if (isNaN(val)) val = 95.5;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    setTargetKPI(val);
    localStorage.setItem('queueTargetKPI', val.toString());
    setIsEditingTarget(false);
  };

  const computeYearlyKPI = (yData: QueueReportItem[]) => {
    if (!yData || yData.length === 0) {
      setYearlyKPI(0);
      return;
    }
    const monthlyStats: Record<string, { total: number, delayed: number }> = {};
    yData.forEach(t => {
      const parts = (t.weight1 || '').split(' ');
      if (parts.length > 0) {
        const dParts = parts[0].split('/');
        if (dParts.length === 3) {
          const m = dParts[1];
          if (!monthlyStats[m]) monthlyStats[m] = { total: 0, delayed: 0 };
          monthlyStats[m].total++;
          
          const tParts = (t.timing || '').split(':').map(Number);
          const mins = tParts.length >= 3 ? ((tParts[0] * 24 * 60) + (tParts[1] * 60) + tParts[2]) : 0;
          if (mins > 60) {
            monthlyStats[m].delayed++;
          }
        }
      }
    });

    let sumKPI = 0;
    let count = 0;
    Object.values(monthlyStats).forEach(stat => {
      if (stat.total > 0) {
        const kpi = ((stat.total - stat.delayed) / stat.total) * 100;
        sumKPI += kpi;
        count++;
      }
    });
    setYearlyKPI(count > 0 ? sumKPI / count : 0);
  };

  useEffect(() => {
    if (selectedMonth === 'ALL') {
      setDateFrom(`${selectedYear}-01-01`);
      setDateTo(`${selectedYear}-12-31`);
    } else {
      const monthStr = selectedMonth.toString().padStart(2, '0');
      setDateFrom(`${selectedYear}-${monthStr}-01`);
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      setDateTo(`${selectedYear}-${monthStr}-${lastDay}`);
    }
  }, [selectedYear, selectedMonth]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  
  // Login State
  const [needsLogin, setNeedsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Inline reason entry state
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const parseCPDate = (str: string) => {
    try {
      if (!str) return new Date().toISOString();
      const parts = str.trim().split(' ');
      if (parts.length < 2) return new Date().toISOString();
      const [d, t] = parts;
      const [day, month, year] = d.split('/');
      return new Date(`${year}-${month}-${day}T${t}:00`).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleSaveReason = async (truck: QueueReportItem) => {
    const reason = reasons[truck.licensePlate]?.trim();
    if (!reason) {
      alert('Vui lòng nhập lý do');
      return;
    }
    setSaving(truck.licensePlate);
    try {
      const formData = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        vehiclePlate: truck.licensePlate,
        material: truck.material,
        timeIn: parseCPDate(truck.weight1),
        timeOut: parseCPDate(truck.weight2),
        reasonForDelay: reason
      };
      await apiClient('/api/records', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Đã lưu lý do thành công!');
    } catch (err: any) {
      console.error('Failed to save reason:', err);
      alert('Lỗi lưu lý do: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(null);
    }
  };

  const fetchData = async (isManualSync = false) => {
    if (!dateFrom || !dateTo) return;
    
    // 1. Load local data first if it's an auto-fetch
    if (!isManualSync) {
      setLoading(true);
      try {
        const responseData = await apiClient<QueueReportItem[]>(`/api/trucks/queue-report?from=${dateFrom}&to=${dateTo}&sync=false`);
        if (responseData) {
          setData(responseData);
          setNeedsLogin(false);
        }
        
        const yFrom = `${selectedYear}-01-01`;
        const yTo = `${selectedYear}-12-31`;
        if (dateFrom === yFrom && dateTo === yTo && responseData) {
          computeYearlyKPI(responseData);
        } else {
          const yData = await apiClient<QueueReportItem[]>(`/api/trucks/queue-report?from=${yFrom}&to=${yTo}&sync=false`);
          if (yData) computeYearlyKPI(yData);
        }
      } catch (err: any) {
        console.error('Failed to fetch local queue report:', err);
      } finally {
        setLoading(false);
      }
    }

    // 2. Background sync from CP web only if current month or manual trigger
    const now = new Date();
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);
    
    const shouldSync = isManualSync || isCurrentMonth;

    if (shouldSync) {
      setIsSyncing(true);
      setSyncError('');
      try {
        const syncData = await apiClient<QueueReportItem[]>(`/api/trucks/queue-report?from=${dateFrom}&to=${dateTo}&sync=true`);
        if (syncData) {
          setData(syncData);
          setNeedsLogin(false);
          
          const yFrom = `${selectedYear}-01-01`;
          const yTo = `${selectedYear}-12-31`;
          if (dateFrom === yFrom && dateTo === yTo) {
            computeYearlyKPI(syncData);
          } else {
            const ySyncData = await apiClient<QueueReportItem[]>(`/api/trucks/queue-report?from=${yFrom}&to=${yTo}&sync=true`);
            if (ySyncData) computeYearlyKPI(ySyncData);
          }
        }
      } catch (err: any) {
        console.error('Failed to sync queue report:', err);
        if (err.message && err.message.includes('REQUIRES_LOGIN')) {
          setNeedsLogin(true);
          setSyncError('Mất kết nối C.P (Cần đăng nhập)');
        } else {
          setSyncError('Lỗi kết nối C.P');
        }
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [dateFrom, dateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      if (username && password) {
        await apiClient('/api/trucks/queue-login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
      } else if (needsLogin) {
        setLoginError('Vui lòng nhập tài khoản và mật khẩu');
        setIsLoggingIn(false);
        return;
      }
      
      setNeedsLogin(false);
      fetchData(true);
    } catch (err: any) {
      setLoginError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const totalTrucks = data.length;
  const delayedTrucks = data.filter(d => {
    const parts = (d.timing || '').split(':').map(Number);
    if (parts.length < 3) return false;
    const totalMinutes = (parts[0] * 24 * 60) + (parts[1] * 60) + parts[2];
    return totalMinutes > 60;
  });

  const getTruckType = (material: string) => {
    const m = material.toLowerCase();
    const bao = ["chất phụ gia", "phụ phẩm bột ngọt", "đường", "vitamin và khoáng chất", "bột váng sữa", "bột thịt xương heo", "muối biển", "nguyên liệu # soytide", "mono canxi phốt phát", "bột đá (to)", "bột lông vũ"];
    const liquid = ["mật rỉ", "dầu cá tra", "dầu nành thô"];
    
    if (bao.some(b => m.includes(b))) return 'Bao';
    if (liquid.some(l => m.includes(l))) return 'Liquid';
    return 'Xá';
  };

  let delayedBao = 0;
  let delayedLiquid = 0;
  let delayedXa = 0;
  delayedTrucks.forEach(t => {
    const type = getTruckType(t.material);
    if (type === 'Bao') delayedBao++;
    else if (type === 'Liquid') delayedLiquid++;
    else delayedXa++;
  });

  const percentPassed = totalTrucks > 0 ? ((totalTrucks - delayedTrucks.length) / totalTrucks) * 100 : 0;

  // --- STATS COMPUTATION ---
  const materialStats = {} as Record<string, { count: number, totalTime: number, totalWeight: number, type: string }>;
  const reasonStats = {} as Record<string, number>;
  
  let totalDelayTime = 0;
  let totalDelayWeight = 0;

  delayedTrucks.forEach(t => {
    const parts = (t.timing || '').split(':').map(Number);
    const mins = parts.length === 3 ? ((parts[0] * 24 * 60) + (parts[1] * 60) + parts[2]) : 0;
    totalDelayTime += mins;
    totalDelayWeight += t.netWeight || 0;

    const type = getTruckType(t.material);
    if (!materialStats[t.material]) {
      materialStats[t.material] = { count: 0, totalTime: 0, totalWeight: 0, type };
    }
    materialStats[t.material].count++;
    materialStats[t.material].totalTime += mins;
    materialStats[t.material].totalWeight += t.netWeight || 0;

    const reasonStr = reasons[t.licensePlate] || 'Chưa cập nhật lý do';
    
    if (!reasonStats[reasonStr]) reasonStats[reasonStr] = 0;
    reasonStats[reasonStr]++;
  });

  const avgDelayTime = delayedTrucks.length > 0 ? Math.round(totalDelayTime / delayedTrucks.length) : 0;
  const avgDelayWeight = delayedTrucks.length > 0 ? (totalDelayWeight / delayedTrucks.length).toFixed(1) : 0;

  const topMaterials = Object.entries(materialStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  const topReasons = Object.entries(reasonStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="flex flex-col gap-2 h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-3 lg:p-4">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 relative z-50 shrink-0">
        
        {/* Left Side: Title */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 px-2">
           <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Truck Tracking</h1>
           {isSyncing ? (
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
               <Loader2 className="w-3.5 h-3.5 animate-spin" />
               <span className="text-xs font-semibold">Đang đồng bộ từ CP...</span>
             </div>
           ) : syncError ? (
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
               <AlertTriangle className="w-3.5 h-3.5" />
               <span className="text-xs font-semibold">{syncError}</span>
             </div>
           ) : null}
        </div>

        {/* Center: Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 flex-1">
          {/* Quick Login Form */}
          <form onSubmit={handleLogin} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700">
            {needsLogin && (
              <>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tài khoản CP"
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm w-28 focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm w-28 focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                />
              </>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`px-3 py-1 text-sm font-bold rounded flex items-center gap-1 transition-colors ${
                needsLogin || loginError 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lấy dữ liệu'}
            </button>
          </form>

          {/* Month/Year Filter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Cả Năm</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Tháng {m}</option>
              ))}
            </select>
            <span className="text-slate-400">/</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: UserMenu */}
        <div className="shrink-0 flex justify-end px-2">
           <UserMenu />
        </div>
      </div>

      {loginError && (
        <div className="p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Số Xe Nhập</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100">{totalTrucks}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số Xe Trễ {'>'} 1 Giờ</p>
            <div className="flex items-end justify-between gap-1">
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 leading-none">{delayedTrucks.length}</p>
              <div className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded"><span className="text-rose-500 text-xs font-bold leading-none mb-0.5">{delayedXa}</span><span>Xá</span></div>
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded"><span className="text-rose-500 text-xs font-bold leading-none mb-0.5">{delayedBao}</span><span>Bao</span></div>
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded"><span className="text-rose-500 text-xs font-bold leading-none mb-0.5">{delayedLiquid}</span><span>Liquid</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tỉ Lệ Đạt</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{percentPassed.toFixed(1)}%</p>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-3 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors"
          onClick={() => {
            if (!isEditingTarget) {
              setTempTarget(targetKPI.toString());
              setIsEditingTarget(true);
            }
          }}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target KPI</p>
            {isEditingTarget ? (
              <input 
                autoFocus
                type="number" 
                step="0.1"
                className="w-20 bg-transparent border-b border-indigo-400 text-xl font-black text-indigo-600 dark:text-indigo-400 outline-none"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                onBlur={handleTargetSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTargetSubmit()}
              />
            ) : (
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{targetKPI}%</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">KPI Năm</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400">{yearlyKPI.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ KPI năm */}
      {!loading && (
        <QueueKPI data={data} target={isEditingTarget ? (parseFloat(tempTarget) || 0) : targetKPI} />
      )}

      {/* Delayed Trucks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Danh Sách Xe Trễ Giờ (Cần Cập Nhật Lý Do)</h3>
          </div>
          <button 
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md shadow-sm border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Xem Thống Kê Trễ Giờ</span>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Biển Số</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Nhà Cung Cấp</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Nguyên Liệu</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Giờ Cân 1</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs">Giờ Cân 2</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs text-center">Timing</th>
                <th className="px-4 py-3 font-semibold uppercase text-xs text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : needsLogin && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Chưa có kết nối đến hệ thống C.P</p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Vui lòng điền Tài khoản & Mật khẩu ở góc trên và nhấn "Lấy dữ liệu".</p>
                    </div>
                  </td>
                </tr>
              ) : delayedTrucks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Không có xe nào trễ giờ trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                delayedTrucks.map((truck, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{truck.licensePlate}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{truck.vendor}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                        {truck.material}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-[13px]">{truck.weight1}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-[13px]">{truck.weight2}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded">
                        {truck.timing}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nhập lý do trễ..."
                          value={reasons[truck.licensePlate] || ''}
                          onChange={(e) => setReasons(prev => ({ ...prev, [truck.licensePlate]: e.target.value }))}
                          className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleSaveReason(truck)}
                          disabled={saving === truck.licensePlate}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm font-medium transition"
                        >
                          {saving === truck.licensePlate ? '...' : 'Lưu'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Thống kê Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thống Kê Xe Trễ Giờ</h2>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Nguyên nhân */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-1">Nguyên Nhân Lỗi Phổ Biến</h3>
                <ul className="space-y-2">
                  {topReasons.length > 0 ? topReasons.map((r, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300 truncate pr-2" title={r[0]}>{r[0]}</span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">{r[1]} xe</span>
                    </li>
                  )) : <p className="text-sm text-slate-500 italic">Chưa có dữ liệu lý do</p>}
                </ul>
              </div>

              {/* Loại hàng */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-1">Loại Hàng Nhập Trễ Nhiều</h3>
                <ul className="space-y-2">
                  {topMaterials.length > 0 ? topMaterials.map((m, i) => {
                    const avgTime = Math.round(m[1].totalTime / m[1].count);
                    const avgWeight = ((m[1].totalWeight / m[1].count) / 1000).toFixed(1);
                    return (
                    <li key={i} className="flex flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center flex-1 min-w-0 pr-4">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold truncate" title={m[0]}>{m[0]}</span>
                        <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ml-2 ${
                          m[1].type === 'Bao' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          m[1].type === 'Liquid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {m[1].type}
                        </span>
                      </div>
                      <div className="flex items-center shrink-0 gap-4 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 w-24 text-right">TB: <strong className="text-slate-700 dark:text-slate-300">{avgTime} phút</strong></span>
                        <span className="text-slate-500 dark:text-slate-400 w-20 text-right">TB: <strong className="text-slate-700 dark:text-slate-300">{avgWeight} tấn</strong></span>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full w-14 text-center">{m[1].count} xe</span>
                      </div>
                    </li>
                  )}) : <p className="text-sm text-slate-500 italic">Chưa có dữ liệu</p>}
                </ul>
              </div>

            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button onClick={() => setIsStatsModalOpen(false)} className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded font-medium transition">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
