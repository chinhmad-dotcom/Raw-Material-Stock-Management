import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { getExtruderProduction, getExtruderOEE, checkExtruderReport } from '../../api/extruderApi';

export default function ExtruderOEE() {
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

  const availableYears = Array.from(new Set(productionData.map(d => d.year || new Date().getFullYear()))).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(productionData.filter(d => d.year === selectedYear).map(d => d.month || new Date().getMonth() + 1))).sort((a, b) => a - b);

  const filteredData = productionData.filter(d => d.year === selectedYear && d.month === selectedMonth);

  const chartData = filteredData.map(d => ({
    name: d.date.toString(),
    oee: (d.oee?.average || 0) * 100,
    target: (d.oee?.target || 0) * 100
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const flatLosses = filteredData.flatMap(d => (d.losses || []).map((l: any, index: number) => ({
    id: `${d.date}-${l.code}-${index}`,
    date: d.date,
    code: l.code,
    description: l.description,
    totalCount: l.occurrences || 0,
    totalTime: l.timeMins || 0
  }))).filter(l => l.totalCount > 0 || l.totalTime > 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Nửa trên: Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 p-4 flex-none lg:flex-[3] xl:flex-[4] flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> OEE Trend (%)
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-blue-500 py-1.5 px-3 font-medium outline-none cursor-pointer"
              >
                {availableMonths.length === 0 && <option value={selectedMonth}>Month {selectedMonth}</option>}
                {availableMonths.map(m => (
                  <option key={m} value={m}>Month {m}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-blue-500 py-1.5 px-3 font-medium outline-none cursor-pointer"
              >
                {availableYears.length === 0 && <option value={selectedYear}>{selectedYear}</option>}
                {availableYears.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[200px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value.toFixed(1) + '%', '']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="oee" name="Actual OEE (%)" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="step" dataKey="target" name="OEE Target (%)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium">
              No OEE data for this month.
            </div>
          )}
        </div>
      </div>

      {/* Nửa dưới: Danh sách Loss */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 p-4 flex-none lg:flex-[1] flex flex-col min-h-[300px] max-h-[500px] lg:max-h-full">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-rose-500" /> Loss List
        </h2>
        <div className="overflow-y-auto flex-1 min-h-0 border border-slate-100 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0">
              <tr>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">Code</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">Cause</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">Total Occurrences</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">Total Time (mins)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flatLosses.map(loss => (
                <tr key={loss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition-colors">
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{loss.date}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md text-xs font-semibold border border-rose-100">
                      {loss.code}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{loss.description}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">{loss.totalCount}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" /> {loss.totalTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {flatLosses.length === 0 && (
            <div className="text-center p-8 text-slate-500 dark:text-slate-400">No loss data.</div>
          )}
        </div>
      </div>
    </div>
  );
}






