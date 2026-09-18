import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
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

export default function QueueKPI({ data, target = 95.5 }: { data: QueueReportItem[], target?: number }) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 p-4 shrink-0 h-full flex flex-col justify-center items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">KPI Nhập Kịp Thời Dưới 1H</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs text-center">Chưa có dữ liệu. Vui lòng lấy dữ liệu để hệ thống tổng hợp KPI.</p>
      </div>
    );
  }

  // Determine if we should group by Day or Month based on date range
  const dates = data.map(d => d.weight1 ? d.weight1.split(' ')[0] : null).filter(Boolean) as string[];
  const uniqueDates = new Set(dates);
  const groupByMonth = uniqueDates.size > 31;

  // Group data
  const groupedData: Record<string, { total: number; passed: number }> = {};
  
  data.forEach(item => {
    if (!item.weight1) return;
    const parts = item.weight1.split(' ')[0]?.split('/');
    if (parts && parts.length === 3) {
      const key = groupByMonth 
        ? `${parts[2]}-${parts[1]}` // YYYY-MM
        : `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        
      if (!groupedData[key]) {
        groupedData[key] = { total: 0, passed: 0 };
      }
      groupedData[key].total += 1;
      if (!isDelayed(item.timing)) {
        groupedData[key].passed += 1;
      }
    }
  });

  const chartData = Object.keys(groupedData).sort().map(key => {
    const { total, passed } = groupedData[key];
    const pct = total > 0 ? (passed / total) * 100 : 0;
    const parts = key.split('-');
    
    return {
      key,
      label: groupByMonth ? `Tháng ${parts[1]}` : `${parts[2]}/${parts[1]}`,
      pct: parseFloat(pct.toFixed(1)),
      total,
      passed
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-white/5 p-4 shrink-0">
      <div className="h-[17rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '6px', color: '#0f172a', fontSize: '12px' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              formatter={(value: number, name: string, props: any) => {
                const { total, passed } = props.payload;
                const delayed = total - passed;
                return [`${value}% (Trễ: ${delayed} / Tổng: ${total})`, 'Tỉ lệ đạt'];
              }}
            />
            <ReferenceLine y={target} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: `Mục tiêu ${target}%`, fill: '#ef4444', fontSize: 11 }} />
            <Bar dataKey="pct" name="Tỉ lệ đạt (%)" radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList dataKey="pct" position="insideTop" fill="#fff" fontSize={11} formatter={(v: number) => v + '%'} />
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pct >= target ? '#10b981' : '#f43f5e'} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
