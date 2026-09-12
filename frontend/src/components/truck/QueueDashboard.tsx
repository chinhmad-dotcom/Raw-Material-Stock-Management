import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertTriangle, ArrowRight, Loader2, Calendar } from 'lucide-react';
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
  // Filter State
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1); // Đầu tháng
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Login State
  const [needsLogin, setNeedsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Inline reason entry state
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const responseData = await apiClient<QueueReportItem[]>(`/api/trucks/queue-report?from=${dateFrom}&to=${dateTo}`);
      if (responseData) {
        setData(responseData);
        setNeedsLogin(false);
      }
    } catch (err: any) {
      console.error('Failed to fetch queue report:', err);
      if (err.message && err.message.includes('REQUIRES_LOGIN')) {
        setNeedsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await apiClient('/api/trucks/queue-login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      // Login successful, fetch data again
      setNeedsLogin(false);
      fetchData();
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

  return (
    <div className="flex flex-col gap-2 h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-3 lg:p-4">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 relative z-50 shrink-0">
        
        {/* Left Side: Title */}
        <div className="hidden sm:block shrink-0 px-2">
           <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Truck Tracking</h1>
        </div>

        {/* Center: Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 flex-1">
          {/* Quick Login Form */}
          <form onSubmit={handleLogin} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700">
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

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
            <span className="text-slate-400">→</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 shrink-0">
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tỉ Lệ Đạt (Đúng Giờ)</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{percentPassed.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ KPI năm */}
      {!needsLogin && !loading && (
        <QueueKPI />
      )}

      {/* Delayed Trucks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Danh Sách Xe Trễ Giờ (Cần Cập Nhật Lý Do)</h3>
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
              ) : needsLogin ? (
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
    </div>
  );
}
