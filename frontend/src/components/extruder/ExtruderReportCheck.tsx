import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, AlertCircle, Loader2, Calculator } from 'lucide-react';
import { getExtruderProduction, getExtruderOEE, checkExtruderReport } from '../../api/extruderApi';

export default function ExtruderReportCheck() {
  const [productionData, setProductionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncingEnergy, setIsSyncingEnergy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // States for comparison table
  const [bapData, setBapData] = useState({ tonDau: '', tonCuoi: '', suDung: '' });
  const [nanhData, setNanhData] = useState({ tonDau: '', tonCuoi: '', suDung: '' });

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('extruderComparison');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bapData) setBapData(parsed.bapData);
        if (parsed.nanhData) setNanhData(parsed.nanhData);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('extruderComparison', JSON.stringify({ bapData, nanhData }));
  }, [bapData, nanhData]);

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

  const warnings = filteredData.flatMap(d => (d.warnings || []).map((w: any, index: number) => ({
    id: `${d.date}-${w.shift}-${w.machine}-${index}`,
    date: `${String(d.date).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`,
    shift: `Ca ${w.shift}`,
    device: w.machine,
    note: w.message
  })));

  // Calculate comparison data
  let elecBaoCao = { e1: 0, e2: 0, hamer: 0, line: 0 };
  let latestDay = 1;
  let bapBaoCao = 0;
  let nanhBaoCao = 0;

  if (filteredData.length > 0) {
    latestDay = Math.max(...filteredData.map(d => d.date));
    bapBaoCao = filteredData.reduce((sum, d) => sum + (d.bapHap?.ton || 0), 0);
    nanhBaoCao = filteredData.reduce((sum, d) => sum + (d.nanhHap?.ton || 0), 0);
  }


  let elecScraped = { e1: 0, e2: 0, hamer: 0, line: 0 };

  if (filteredData.length > 0) {
    elecBaoCao = filteredData.reduce((acc, d) => {
      if (d.electricity) {
        acc.e1 += d.electricity.e1 || 0;
        acc.e2 += d.electricity.e2 || 0;
        acc.hamer += d.electricity.hamer || 0;
        acc.line += d.electricity.line || 0;
      }
      return acc;
    }, { e1: 0, e2: 0, hamer: 0, line: 0 });

    elecScraped = filteredData.reduce((acc, d) => {
      if (d.electricity) {
        acc.e1 += d.electricity.scraped_e1 || 0;
        acc.e2 += d.electricity.scraped_e2 || 0;
        acc.hamer += d.electricity.scraped_hamer || 0;
        acc.line += d.electricity.scraped_line || 0;
      }
      return acc;
    }, { e1: 0, e2: 0, hamer: 0, line: 0 });
  }
  
  const latestDateStr = `${String(latestDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;

  const bapThucTe = (parseFloat(bapData.tonCuoi) || 0) - (parseFloat(bapData.tonDau) || 0) + (parseFloat(bapData.suDung) || 0);
  const nanhThucTe = (parseFloat(nanhData.tonCuoi) || 0) - (parseFloat(nanhData.tonDau) || 0) + (parseFloat(nanhData.suDung) || 0);

  const bapChenhLech = bapBaoCao - bapThucTe;
  const nanhChenhLech = nanhBaoCao - nanhThucTe;

  
  const [elecData, setElecData] = useState({
    e1: { report: '', mcc: '' },
    e2: { report: '', mcc: '' },
    hamer: { report: '', mcc: '' },
    line: { report: '', mcc: '' }
  });

  useEffect(() => {
    const savedElec = localStorage.getItem('extruderElecComparison');
    if (savedElec) {
      try { setElecData(JSON.parse(savedElec)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('extruderElecComparison', JSON.stringify(elecData));
  }, [elecData]);

  const handleElecInput = (machine: string, field: 'report'|'mcc', val: string) => {
    setElecData(prev => ({
      ...prev,
      [machine]: {
        ...prev[(machine as keyof typeof prev)],
        [field]: val
      }
    }));
  };

  const calculateDiff = (machine: string) => {
    const r = (elecBaoCao as any)[machine] || 0;
    const scraped = (elecScraped as any)[machine];
    const m = scraped ? scraped : (parseFloat((elecData as any)[machine].mcc) || 0);
    if (!r && !m) return null;
    return r - m;
  };

  const renderElecRow = (machineKey: string, machineName: string) => {
    const diff = calculateDiff(machineKey);
    const isError = diff !== null && Math.abs(diff) > 0;
    const scrapedVal = (elecScraped as any)[machineKey];
    const displayVal = scrapedVal ? Math.round(scrapedVal) : (elecData as any)[machineKey].mcc;
    
    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="p-2 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
          {machineName}
        </td>
        <td className="p-2 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-mono font-bold text-slate-700 dark:text-slate-300">
          {Math.round((elecBaoCao as any)[machineKey] || 0)}
        </td>
        <td className="p-0 border-r border-slate-200 dark:border-slate-700 relative">
          <input 
            type="number" 
            value={displayVal}
            onChange={e => handleElecInput(machineKey, 'mcc', e.target.value)}
            disabled={!!scrapedVal}
            className={`w-full h-full p-2 bg-transparent text-center outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 ${scrapedVal ? 'text-blue-600 font-bold' : ''}`}
            placeholder="0"
          />
        </td>
        <td className="p-2 font-mono font-bold">
          {diff === null ? '-' : (
            <span className={isError ? 'text-rose-500' : 'text-emerald-500'}>
              {diff > 0 ? '+' : ''}{Math.round(diff)}
            </span>
          )}
        </td>
      </tr>
    );
  };

  const handleInput = (setFn: React.Dispatch<React.SetStateAction<any>>, field: string, val: string) => {
    setFn((prev: any) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      )}

      {/* Left side: Report Check */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-rose-200 p-6 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-500" /> Kiểm tra Nhập liệu
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hệ thống phát hiện lỗi lệch số điện trong báo cáo.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-rose-500 py-1.5 px-3 font-medium outline-none cursor-pointer"
              >
                {availableMonths.length === 0 && <option value={selectedMonth}>Tháng {selectedMonth}</option>}
                {availableMonths.map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-rose-500 py-1.5 px-3 font-medium outline-none cursor-pointer"
              >
                {availableYears.length === 0 && <option value={selectedYear}>{selectedYear}</option>}
                {availableYears.map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
            
            {warnings.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm">
                <Zap className="w-4 h-4" /> Phát hiện {warnings.length} lỗi
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto border border-rose-100 rounded-xl flex-1 min-h-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-rose-50 dark:bg-rose-900/30 sticky top-0">
              <tr>
                <th className="p-3 font-semibold text-rose-800 w-24">Ngày</th>
                <th className="p-3 font-semibold text-rose-800 w-20">Ca</th>
                <th className="p-3 font-semibold text-rose-800 w-48">Thiết bị</th>
                <th className="p-3 font-semibold text-rose-800">Cảnh báo / Nguyên nhân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {warnings.map(warning => (
                <tr key={warning.id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{warning.date}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{warning.shift}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">{warning.device}</td>
                  <td className="p-3">
                    <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 leading-tight">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {warning.note}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && warnings.length === 0 && (
            <div className="text-center p-12 text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <ShieldAlert className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-medium text-lg text-green-700">Tất cả số điện đều khớp, dữ liệu hợp lệ!</p>
            </div>
          )}
        </div>

        {/* Bảng so sánh số điện */}
        <div className="shrink-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4 mb-2">
           <div className="bg-slate-100 dark:bg-slate-800 p-2.5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-500" /> So sánh số điện
             </h3>
             <div className="flex items-center gap-2">
               {syncError && <span className="text-red-500 text-xs font-bold">{syncError}</span>}
               <button 
                 onClick={async () => {
                   try {
                     setIsSyncingEnergy(true);
                     setSyncError(null);
                     const res = await fetch('/api/extruder/sync-energy', {
                       method: 'POST',
                       body: JSON.stringify({ month: selectedMonth, year: selectedYear })
                     });
                     if (!res.ok) throw new Error('Failed');
                     await fetchData();
                   } catch (e) {
                     setSyncError('Lỗi kết nối trang web điện');
                   } finally {
                     setIsSyncingEnergy(false);
                   }
                 }}
                 disabled={isSyncingEnergy}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 flex items-center gap-2 text-xs font-bold rounded-md shadow-sm transition disabled:opacity-50"
               >
                 {isSyncingEnergy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                 {isSyncingEnergy ? 'Đang đồng bộ...' : 'Đồng bộ từ web'}
               </button>
             </div>
           </div>
           <table className="w-full text-center text-sm">
             <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
               <tr>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-left w-1/3">Thiết bị</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Báo cáo</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Thực tế MCC</th>
                 <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Chênh lệch</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {renderElecRow('e1', 'Extruder bắp E1')}
                {renderElecRow('e2', 'Extruder nành E2')}
                {renderElecRow('hamer', 'Hamer')}
                {renderElecRow('line', 'Line')}
             </tbody>
           </table>
        </div>
      </div>

      {/* Right side: Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full overflow-hidden">
        <div className="mb-6 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-500" /> Output Comparison
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compare Report Data with Actual Stock.</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto flex-1 min-h-0">
          <table className="w-full text-center text-sm min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-left bg-blue-50 text-blue-800">
                  {latestDateStr}
                </th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Opening Stock</th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Closing Stock</th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Reported Output</th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Usage</th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Actual Quantity</th>
                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Corn */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">
                <td className="p-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-left">Corn</td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={bapData.tonDau} 
                    onChange={e => handleInput(setBapData, 'tonDau', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={bapData.tonCuoi} 
                    onChange={e => handleInput(setBapData, 'tonCuoi', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                  {bapBaoCao.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={bapData.suDung} 
                    onChange={e => handleInput(setBapData, 'suDung', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 font-mono font-medium text-blue-700 border-r border-slate-200 dark:border-slate-700 bg-blue-50">
                  {bapThucTe.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
                <td className={`p-2 font-mono font-bold ${Math.abs(bapChenhLech) > 0.1 ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : 'text-green-600 bg-green-50'}`}>
                  {bapChenhLech > 0 ? '+' : ''}{bapChenhLech.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
              </tr>
              {/* Soy */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">
                <td className="p-2 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-left">Soy</td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={nanhData.tonDau} 
                    onChange={e => handleInput(setNanhData, 'tonDau', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={nanhData.tonCuoi} 
                    onChange={e => handleInput(setNanhData, 'tonCuoi', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                  {nanhBaoCao.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
                <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                  <input 
                    type="number" 
                    value={nanhData.suDung} 
                    onChange={e => handleInput(setNanhData, 'suDung', e.target.value)}
                    className="w-full p-1.5 text-center border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                </td>
                <td className="p-2 font-mono font-medium text-blue-700 border-r border-slate-200 dark:border-slate-700 bg-blue-50">
                  {nanhThucTe.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
                <td className={`p-2 font-mono font-bold ${Math.abs(nanhChenhLech) > 0.1 ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : 'text-green-600 bg-green-50'}`}>
                  {nanhChenhLech > 0 ? '+' : ''}{nanhChenhLech.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

