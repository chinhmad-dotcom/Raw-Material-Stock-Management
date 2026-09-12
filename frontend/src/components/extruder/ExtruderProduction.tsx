import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Settings, Zap, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { getExtruderProduction, getExtruderOEE, checkExtruderReport } from '../../api/extruderApi';

export default function ExtruderProduction() {
  const [productionData, setProductionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getExtruderProduction();
      setProductionData(data || []);
      
      // Auto select the most recent month available
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        
      }
    } catch (err: any) {
      console.error('Failed to fetch extruder data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique years and months
  const availableYears = Array.from(new Set(productionData.map(d => d.year || new Date().getFullYear()))).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(productionData.filter(d => d.year === selectedYear).map(d => d.month || new Date().getMonth() + 1))).sort((a, b) => a - b);

  // Filter data for the selected month and year
  const filteredData = productionData.filter(d => d.year === selectedYear && d.month === selectedMonth);

  // Convert raw daily data to chart format
  const chartData = filteredData.map(d => ({
    name: d.date.toString(),
    bapHap: d.bapHap?.ton || 0,
    nanhHap: d.nanhHap?.ton || 0
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const totalBapHap = filteredData.reduce((sum, d) => sum + (d.bapHap?.ton || 0), 0);
  const totalNanhHap = filteredData.reduce((sum, d) => sum + (d.nanhHap?.ton || 0), 0);
  
  // Calculate averages for speed and energy (excluding zeros for accurate avg)
  const bapHapRecords = filteredData.filter(d => d.bapHap?.ton > 0);
  const nanhHapRecords = filteredData.filter(d => d.nanhHap?.ton > 0);

  const avgBapHapSpeed = bapHapRecords.length ? bapHapRecords.reduce((sum, d) => sum + d.bapHap.tonPerHour, 0) / bapHapRecords.length : 0;
  const avgNanhHapSpeed = nanhHapRecords.length ? nanhHapRecords.reduce((sum, d) => sum + d.nanhHap.tonPerHour, 0) / nanhHapRecords.length : 0;
  
  const totalBapHapKwh = filteredData.reduce((sum, d) => sum + (d.bapHap?.totalKWh || 0), 0);
  const totalNanhHapKwh = filteredData.reduce((sum, d) => sum + (d.nanhHap?.totalKWh || 0), 0);
  
  const avgBapHapKwh = totalBapHap > 0 ? (totalBapHapKwh / totalBapHap) : 0;
  const avgNanhHapKwh = totalNanhHap > 0 ? (totalNanhHapKwh / totalNanhHap) : 0;

  // New Metrics (Added)
  const totalBapHapHours = bapHapRecords.reduce((sum, d) => sum + (d.bapHap.tonPerHour > 0 ? d.bapHap.ton / d.bapHap.tonPerHour : 0), 0);
  const totalNanhHapHours = nanhHapRecords.reduce((sum, d) => sum + (d.nanhHap.tonPerHour > 0 ? d.nanhHap.ton / d.nanhHap.tonPerHour : 0), 0);

  const bapHapRunDays = bapHapRecords.length;
  const nanhHapRunDays = nanhHapRecords.length;

  const avgBapHapHoursPerDay = bapHapRunDays > 0 ? (totalBapHapHours / bapHapRunDays) : 0;
  const avgNanhHapHoursPerDay = nanhHapRunDays > 0 ? (totalNanhHapHours / nanhHapRunDays) : 0;

  const avgBapHapTonPerDay = bapHapRunDays > 0 ? (totalBapHap / bapHapRunDays) : 0;
  const avgNanhHapTonPerDay = nanhHapRunDays > 0 ? (totalNanhHap / nanhHapRunDays) : 0;

  return (
    <div className="flex flex-col gap-2 h-full min-h-[500px] md:min-h-0">
      {/* Output Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 p-3 flex-1 flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Output Chart
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-blue-500 py-1 px-2 font-medium outline-none cursor-pointer"
              >
                {availableMonths.length === 0 && <option value={selectedMonth}>Month {selectedMonth}</option>}
                {availableMonths.map(m => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-blue-500 py-1 px-2 font-medium outline-none cursor-pointer"
              >
                {availableYears.length === 0 && <option value={selectedYear}>{selectedYear}</option>}
                {availableYears.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-[150px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '5px' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Legend wrapperStyle={{ paddingTop: '5px' }} />
                <Bar dataKey="bapHap" name="Corn (t)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25}>
                  <LabelList dataKey="bapHap" position="top" fill="#3b82f6" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? val : ''} />
                </Bar>
                <Bar dataKey="nanhHap" name="Soy (t)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25}>
                  <LabelList dataKey="nanhHap" position="top" fill="#10b981" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? val : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium">
              No data available. Please upload a report.
            </div>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-none">
        
        {/* Corn Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-base uppercase tracking-wider">BẮP HẤP (CORN)</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Tổng số tấn</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 leading-tight">{totalBapHap.toLocaleString(undefined, { maximumFractionDigits: 1 })} t</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Tổng giờ</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{totalBapHapHours.toFixed(1)} h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Số ngày chạy</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{bapHapRunDays} ngày</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">TB giờ/ngày</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgBapHapHoursPerDay.toFixed(1)} h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">TB tấn/ngày</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgBapHapTonPerDay.toFixed(1)} t</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Hiệu suất</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgBapHapSpeed.toFixed(1)} t/h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Điện năng</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgBapHapKwh.toFixed(1)} kW/t</span>
            </div>
          </div>
        </div>

        {/* Soy Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-base uppercase tracking-wider">NÀNH HẤP (SOY)</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Tổng số tấn</span>
              <span className="text-lg font-black text-green-600 dark:text-green-400 leading-tight">{totalNanhHap.toLocaleString(undefined, { maximumFractionDigits: 1 })} t</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Tổng giờ</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{totalNanhHapHours.toFixed(1)} h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Số ngày chạy</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{nanhHapRunDays} ngày</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">TB giờ/ngày</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgNanhHapHoursPerDay.toFixed(1)} h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">TB tấn/ngày</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgNanhHapTonPerDay.toFixed(1)} t</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Hiệu suất</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgNanhHapSpeed.toFixed(1)} t/h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Điện năng</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight">{avgNanhHapKwh.toFixed(1)} kW/t</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
