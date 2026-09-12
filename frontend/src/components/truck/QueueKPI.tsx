import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { apiClient } from '../../api/apiClient';

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

const isDelayed = (timingStr: string) => {
  if (!timingStr) return false;
  const parts = timingStr.split(':');
  if (parts.length < 3) return false;
  const days = parseInt(parts[0], 10) || 0;
  const hours = parseInt(parts[1], 10) || 0;
  const minutes = parseInt(parts[2], 10) || 0;
  
  const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
  return totalMinutes > 60;
};

export default function QueueKPI() {
  const [history, setHistory] = useState<QueueReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient<QueueReportItem[]>('/api/trucks/queue-history');
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load queue history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-slate-400 p-4">Đang tải dữ liệu KPI...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 p-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">KPI Nhập Kịp Thời Dưới 1H</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Chưa có dữ liệu lịch sử. Vui lòng lấy dữ liệu từ các tháng để hệ thống tự động tổng hợp.</p>
      </div>
    );
  }

  // Nhóm dữ liệu theo tháng
  const monthlyData: Record<string, { total: number; passed: number }> = {};
  
  history.forEach(item => {
    if (!item.weight1) return;
    // format DD/MM/YYYY
    const parts = item.weight1.split(' ')[0]?.split('/');
    if (parts && parts.length === 3) {
      const month = `${parts[2]}-${parts[1]}`; // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, passed: 0 };
      }
      monthlyData[month].total += 1;
      if (!isDelayed(item.timing)) {
        monthlyData[month].passed += 1;
      }
    }
  });

  const chartData = Object.keys(monthlyData).sort().map(month => {
    const { total, passed } = monthlyData[month];
    const pct = total > 0 ? (passed / total) * 100 : 0;
    return {
      month, // YYYY-MM
      label: `Tháng ${month.split('-')[1]}`,
      pct: parseFloat(pct.toFixed(1)),
      total,
      passed
    };
  });

  const totalAll = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const passedAll = chartData.reduce((acc, curr) => acc + curr.passed, 0);
  const avgPct = totalAll > 0 ? (passedAll / totalAll) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 p-4 shrink-0">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">KPI Nhập Kịp Thời Theo Tháng</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Mục tiêu: Đạt &gt; 95.5% số xe có thời gian lấy mẫu dưới 1 giờ.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Trung bình Năm</p>
          <p className={`text-xl font-black ${avgPct >= 95.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {avgPct.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', color: '#0f172a', fontSize: '12px' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value}%`, 'Tỷ lệ đạt']}
            />
            <ReferenceLine y={95.5} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Mục tiêu 95.5%', fill: '#ef4444', fontSize: 11 }} />
            <Bar dataKey="pct" name="Tỷ lệ đạt (%)" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pct >= 95.5 ? '#10b981' : '#f43f5e'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
