import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMenu } from '../components/layout/UserMenu';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';
import { Truck, Zap, Activity, Loader2 } from 'lucide-react';

export default function KpiDashboard() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [targets, setTargets] = useState({ truck: 80, elecReceive: 0.8, elecExtruder: 220 });
  
  // Dữ liệu biểu đồ
  const [truckData, setTruckData] = useState<{month: string, val: number}[]>([]);
  const [elecReceiveData, setElecReceiveData] = useState<{month: string, val: number}[]>([]);
  const [elecExtruderData, setElecExtruderData] = useState<{month: string, val: number}[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tgtRes, truckRes, elecRecRes, elecExtRes] = await Promise.all([
        fetch(`http://localhost:5147/api/kpi/targets`),
        fetch(`http://localhost:5147/api/trucks/queue-report?from=${selectedYear}-01-01&to=${selectedYear}-12-31&sync=false`),
        fetch(`http://localhost:5147/api/reports/electricity-cost-yearly?year=${selectedYear}`),
        fetch(`http://localhost:5147/api/extruder/production?year=${selectedYear}`)
      ]);
      
      const tgtJson = await tgtRes.json();
      if (tgtJson.data) setTargets(tgtJson.data);
      
      const truckJson = await truckRes.json();
      if (Array.isArray(truckJson)) {
          const monthlyStats: Record<string, { total: number, delayed: number }> = {};
          for (let i = 1; i <= 12; i++) {
              monthlyStats[i.toString()] = { total: 0, delayed: 0 };
          }
          
          truckJson.forEach((t: any) => {
              const parts = (t.weight1 || '').split(' ');
              if (parts.length > 0) {
                  const dParts = parts[0].split('/');
                  if (dParts.length === 3) {
                      const m = parseInt(dParts[1]).toString();
                      if (monthlyStats[m]) {
                          monthlyStats[m].total++;
                          
                          const tParts = (t.timing || '').split(':').map(Number);
                          const mins = tParts.length >= 3 ? ((tParts[0] * 24 * 60) + (tParts[1] * 60) + tParts[2]) : 0;
                          if (mins > 60) {
                              monthlyStats[m].delayed++;
                          }
                      }
                  }
              }
          });
          
          const tChart = [];
          for (let i = 1; i <= 12; i++) {
              const mStr = i.toString();
              const stat = monthlyStats[mStr];
              const val = stat.total > 0 ? ((stat.total - stat.delayed) / stat.total) * 100 : 0;
              tChart.push({ month: mStr, val });
          }
          setTruckData(tChart);
      }
      
      const elecRecJson = await elecRecRes.json();
      if (elecRecJson.data) setElecReceiveData(elecRecJson.data);

      const elecExtJson = await elecExtRes.json();
      
      // Compute extruder yearly average from daily extruder data
      if (Array.isArray(elecExtJson)) {
          const extMonthly = Array(12).fill(0).map(() => ({ totalTons: 0, totalKwh: 0 }));
          elecExtJson.forEach((r: any) => {
              if (r.year === selectedYear) {
                  const mIdx = Number(r.month) - 1;
                  if (mIdx >= 0 && mIdx < 12) {
                      const bap = r.produce_bap || 0;
                      const nanh = r.produce_nanh || 0;
                      extMonthly[mIdx].totalTons += (bap + nanh);
                      
                      const e = r.electricity || {};
                      const kwh = (e.scraped_e1 || 0) + (e.scraped_e2 || 0) + (e.scraped_hamer || 0) + (e.scraped_line || 0);
                      extMonthly[mIdx].totalKwh += kwh;
                  }
              }
          });
          const extChart = extMonthly.map((m, idx) => ({
              month: (idx + 1).toString(),
              val: m.totalTons > 0 ? m.totalKwh / m.totalTons : 0
          }));
          setElecExtruderData(extChart);
      }

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTargetChange = (key: string, value: string) => {
    const num = Number(value);
    if (isNaN(num)) return;
    const newTargets = { ...targets, [key]: num };
    setTargets(newTargets);
    
    setSaving(true);
    fetch(`http://localhost:5147/api/kpi/targets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTargets)
    }).finally(() => setSaving(false));
  };

  // Tính trung bình năm
  const avgTruck = useMemo(() => {
    const valid = truckData.filter(d => d.val > 0);
    return valid.length ? valid.reduce((s, d) => s + d.val, 0) / valid.length : 0;
  }, [truckData]);

  const avgElecReceive = useMemo(() => {
    const valid = elecReceiveData.filter(d => d.val > 0);
    return valid.length ? valid.reduce((s, d) => s + d.val, 0) / valid.length : 0;
  }, [elecReceiveData]);

  const avgElecExtruder = useMemo(() => {
    const valid = elecExtruderData.filter(d => d.val > 0);
    return valid.length ? valid.reduce((s, d) => s + d.val, 0) / valid.length : 0;
  }, [elecExtruderData]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-4 overflow-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            KPI RM DASHBOARD
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Chỉ số Hiệu quả Hoạt động Phòng Nguyên liệu</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Năm:</span>
            <select 
              className="border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Xe */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Truck className="w-5 h-5 text-indigo-500" />
              % Xe hoàn thành &lt; 1H
            </div>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800">
                {avgTruck.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500 mt-1">Trung bình năm {selectedYear}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <label className="text-xs text-slate-500 font-medium mb-1 uppercase">Target (%)</label>
              <input 
                type="number"
                className="w-20 border border-slate-200 rounded px-2 py-1 text-right text-indigo-600 font-bold focus:outline-none focus:border-indigo-500 bg-indigo-50"
                value={targets.truck}
                onChange={e => handleTargetChange('truck', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
             <span className="text-slate-500">Trạng thái:</span>
             <span className={`font-semibold px-2 py-0.5 rounded-full ${avgTruck >= targets.truck ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {avgTruck >= targets.truck ? 'ĐẠT' : 'KHÔNG ĐẠT'}
             </span>
          </div>
        </div>

        {/* Card 2: Nhập hàng */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Zap className="w-5 h-5 text-amber-500" />
              Chi phí điện Nhập hàng
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800">
                {avgElecReceive.toFixed(3)}
              </div>
              <div className="text-sm text-slate-500 mt-1">KWH/TON (Trung bình năm)</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <label className="text-xs text-slate-500 font-medium mb-1 uppercase">Target (Max)</label>
              <input 
                type="number"
                step="0.01"
                className="w-20 border border-slate-200 rounded px-2 py-1 text-right text-amber-600 font-bold focus:outline-none focus:border-amber-500 bg-amber-50"
                value={targets.elecReceive}
                onChange={e => handleTargetChange('elecReceive', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
             <span className="text-slate-500">Trạng thái:</span>
             <span className={`font-semibold px-2 py-0.5 rounded-full ${avgElecReceive <= targets.elecReceive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {avgElecReceive <= targets.elecReceive && avgElecReceive > 0 ? 'ĐẠT' : (avgElecReceive === 0 ? 'CHƯA CÓ' : 'KHÔNG ĐẠT')}
             </span>
          </div>
        </div>

        {/* Card 3: Extruder */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Zap className="w-5 h-5 text-blue-500" />
              Chi phí điện Extruder
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800">
                {avgElecExtruder.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500 mt-1">KWH/TON (Trung bình năm)</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <label className="text-xs text-slate-500 font-medium mb-1 uppercase">Target (Max)</label>
              <input 
                type="number"
                className="w-20 border border-slate-200 rounded px-2 py-1 text-right text-blue-600 font-bold focus:outline-none focus:border-blue-500 bg-blue-50"
                value={targets.elecExtruder}
                onChange={e => handleTargetChange('elecExtruder', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
             <span className="text-slate-500">Trạng thái:</span>
             <span className={`font-semibold px-2 py-0.5 rounded-full ${avgElecExtruder <= targets.elecExtruder ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {avgElecExtruder <= targets.elecExtruder && avgElecExtruder > 0 ? 'ĐẠT' : (avgElecExtruder === 0 ? 'CHƯA CÓ' : 'KHÔNG ĐẠT')}
             </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Chart 1 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">% Xe dưới 1H theo tháng</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={truckData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 12}} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="val" name="Thực tế (%)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line 
                  type="monotone" 
                  dataKey={() => targets.truck} 
                  name="Mục tiêu" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Điện Nhập hàng (KWH/Tons)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={elecReceiveData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 12}} tickLine={false} />
                <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="val" name="Thực tế" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line 
                  type="step" 
                  dataKey={() => targets.elecReceive} 
                  name="Mục tiêu" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Điện Extruder (KWH/Tons)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={elecExtruderData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize: 12}} tickLine={false} />
                <YAxis tick={{fontSize: 12}} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="val" name="Thực tế" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line 
                  type="step" 
                  dataKey={() => targets.elecExtruder} 
                  name="Mục tiêu" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
