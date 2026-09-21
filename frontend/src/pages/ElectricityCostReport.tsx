import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMenu } from '../components/layout/UserMenu';
import { FileText, Loader2, Save } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

interface EnergyData {
  before: number;
  after: number;
  used: number;
}

interface DailyRecord {
  date: string;
  materials: Record<string, number>;
  remove: number;
  energy: {
    mcc11: EnergyData;
    mcc12: EnergyData;
    mcc13: EnergyData;
  };
}

const PDF_COLUMNS = [
  { label: 'CORN#ARG', match: ['Corn (ARG#A,#B)'] },
  { label: 'CORN#BRA', match: [] },
  { label: 'WG', match: ['Feed Wheat (UKARAINE, Australia, ARGENTINA, Brazil)'] },
  { label: 'RBF', match: ['RBF, Rice Bran Fresh (S), Rice bran fresh (Premium)'] },
  { label: 'BR', match: ['Broken Rice #C,#B'] },
  { label: 'DDGS', match: ['DDGS, DDGS-pro-26'] },
  { label: 'PKM', match: ['Palm kernel Expeller'] },
  { label: 'TBP', match: ['Tap By Product Fine, Tapioca by product - special (local)'] },
  { label: 'SBM', match: ['Soy Bean Meal -Ex-WH (Local)', 'F.F Soy Bean Meal'] },
  { label: 'COM', match: ['Corn Extrude'] },
  { label: 'CORN#USA', match: [] },
  { label: 'SBH', match: ['Soy Bean Hull'] },
  { label: 'SBS', match: ['Soy Been Seed'] },
  { label: 'CANOLA', match: ['Canola meal'] },
  { label: 'BDG', match: ['Brewer Dried Grain, Brew"s dried Grain - hight.Pro'] },
  { label: 'REMOVE', match: [], isEditable: true },
  { label: 'RSM', match: [] },
  { label: 'RBS', match: ['Rice Bran Solvent'] },
  { label: 'WBr', match: [] },
];

export default function ElectricityCostReport() {
  const { t } = useTranslation();
  const [data, setData] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5147/api/reports/electricity-cost?month=${selectedMonth}&year=${selectedYear}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRemoveChange = (date: string, value: string) => {
    const num = Number(value) || 0;
    setData(prev => prev.map(r => r.date === date ? { ...r, remove: num } : r));
    
    // Save to backend debounce
    setSaving(true);
    fetch(`http://localhost:5147/api/reports/electricity-remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, remove: num })
    }).finally(() => setSaving(false));
  };

  // Tính toán dữ liệu hiển thị
  const tableRows = useMemo(() => {
    return data.map(row => {
      let totalTons = 0;
      const mappedMaterials: Record<string, number> = {};
      
      PDF_COLUMNS.forEach(col => {
        if (col.label === 'REMOVE') {
          mappedMaterials[col.label] = row.remove;
          return;
        }
        let sum = 0;
        col.match.forEach(mName => {
          if (row.materials[mName]) sum += row.materials[mName] / 1000; // Convert kg to tons if needed? Actually receive in Excel is kg.
        });
        mappedMaterials[col.label] = sum;
        totalTons += sum;
      });
      
      // Trừ đi REMOVE
      totalTons -= (row.remove || 0);

      const totalKwh = row.energy.mcc11.used + row.energy.mcc12.used + row.energy.mcc13.used;
      const ave = totalTons > 0 ? totalKwh / totalTons : 0;

      return {
        ...row,
        mappedMaterials,
        totalTons,
        totalKwh,
        ave
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    const sums: Record<string, number> = {};
    let sumTotalTons = 0;
    let sumTotalKwh = 0;
    
    tableRows.forEach(r => {
      PDF_COLUMNS.forEach(col => {
        sums[col.label] = (sums[col.label] || 0) + r.mappedMaterials[col.label];
      });
      sumTotalTons += r.totalTons;
      sumTotalKwh += r.totalKwh;
    });

    return {
      materials: sums,
      totalTons: sumTotalTons,
      totalKwh: sumTotalKwh,
      ave: sumTotalTons > 0 ? sumTotalKwh / sumTotalTons : 0
    };
  }, [tableRows]);

  // Chart data
  const chartData = [
    { month: '1', val: 0.769 }, { month: '2', val: 0.776 }, { month: '3', val: 0.776 },
    { month: '4', val: 0.776 }, { month: '5', val: 0.779 }, { month: '6', val: 0.769 },
    { month: '7', val: 0.772 }, { month: '8', val: 0 }, { month: '9', val: 0 },
    { month: '10', val: 0 }, { month: '11', val: 0 }, { month: '12', val: 0 }
  ];
  chartData[selectedMonth - 1].val = totals.ave;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-50">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Báo cáo chi phí điện</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700"
            value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
          </select>
          <select 
            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700"
            value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {saving && <span className="text-sm text-slate-500 flex items-center gap-1"><Save className="w-3 h-3 animate-pulse"/> Đang lưu...</span>}
          <UserMenu />
        </div>
      </div>

      <div className="flex-1 bg-white overflow-auto border border-slate-300 shadow-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="p-4" style={{ minWidth: '1500px' }}>
            <div className="text-center mb-4">
              <h1 className="font-bold text-blue-800 uppercase" style={{ fontSize: '18px' }}>BÁO CÁO NHẬP HÀNG HẰNG NGÀY</h1>
              <p className="font-bold text-blue-700" style={{ fontSize: '14px' }}>Price Electric Average: 1,016 vnd/ Kw</p>
            </div>
            
            <table className="w-full border-collapse border border-black text-center" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="bg-sky-500 text-white font-bold" style={{ fontSize: '14px' }}>
                  <th className="border border-black p-1" rowSpan={2}>DATE</th>
                  {PDF_COLUMNS.map(c => <th key={c.label} className="border border-black p-1">{c.label}</th>)}
                  <th className="border border-black p-1">TOTAL</th>
                  <th className="border border-black p-1">TOTAL</th>
                  <th className="border border-black p-1">AVE</th>
                  <th className="border border-black p-1" colSpan={3}>MCC13</th>
                  <th className="border border-black p-1" colSpan={3}>MCC11</th>
                  <th className="border border-black p-1" colSpan={3}>MCC12</th>
                </tr>
                <tr className="bg-sky-500 text-white font-bold" style={{ fontSize: '12px' }}>
                  {PDF_COLUMNS.map(c => <th key={c.label} className="border border-black p-1 font-normal">TONS</th>)}
                  <th className="border border-black p-1 font-normal">TONS</th>
                  <th className="border border-black p-1 font-normal">KWH</th>
                  <th className="border border-black p-1 font-normal">KWH/TONS</th>
                  <th className="border border-black p-1 font-normal">E BEFORE</th>
                  <th className="border border-black p-1 font-normal">E AFTER</th>
                  <th className="border border-black p-1 font-normal">total</th>
                  <th className="border border-black p-1 font-normal">E BEFORE</th>
                  <th className="border border-black p-1 font-normal">E AFTER</th>
                  <th className="border border-black p-1 font-normal">total</th>
                  <th className="border border-black p-1 font-normal">E BEFORE</th>
                  <th className="border border-black p-1 font-normal">E AFTER</th>
                  <th className="border border-black p-1 font-normal">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="border border-black p-1 whitespace-nowrap">{row.date}</td>
                    {PDF_COLUMNS.map(c => (
                      <td key={c.label} className="border border-black p-1 min-w-[50px]">
                        {c.isEditable ? (
                          <input 
                            type="number"
                            className="w-full text-center bg-transparent border-none outline-none focus:bg-yellow-100"
                            value={row.mappedMaterials[c.label] || ''}
                            onChange={(e) => handleRemoveChange(row.date, e.target.value)}
                          />
                        ) : (
                          row.mappedMaterials[c.label] > 0 ? row.mappedMaterials[c.label].toFixed(0) : '0'
                        )}
                      </td>
                    ))}
                    <td className="border border-black p-1 bg-white font-bold">{row.totalTons.toFixed(0)}</td>
                    <td className="border border-black p-1 bg-white font-bold">{row.totalKwh.toFixed(0)}</td>
                    <td className="border border-black p-1 bg-white">{row.ave > 0 ? row.ave.toFixed(3) : '#DIV/0!'}</td>
                    
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc13.before}</td>
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc13.after}</td>
                    <td className="border border-black p-1 bg-teal-200">{row.energy.mcc13.used}</td>
                    
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc11.before}</td>
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc11.after}</td>
                    <td className="border border-black p-1 bg-teal-200">{row.energy.mcc11.used}</td>
                    
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc12.before}</td>
                    <td className="border border-black p-1 bg-teal-100">{row.energy.mcc12.after}</td>
                    <td className="border border-black p-1 bg-teal-200">{row.energy.mcc12.used}</td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-green-500 text-white font-bold">
                  <td className="border border-black p-1"></td>
                  {PDF_COLUMNS.map(c => (
                    <td key={c.label} className="border border-black p-1">{totals.materials[c.label] > 0 ? totals.materials[c.label].toFixed(0) : '0'}</td>
                  ))}
                  <td className="border border-black p-1">{totals.totalTons.toFixed(0)}</td>
                  <td className="border border-black p-1">{totals.totalKwh.toFixed(0)}</td>
                  <td className="border border-black p-1"></td>
                  <td colSpan={9} className="border border-black p-1"></td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td colSpan={PDF_COLUMNS.length + 1} className="border border-none p-1 text-right"></td>
                  <td className="border border-black p-1 bg-teal-800 text-yellow-300">total tons</td>
                  <td className="border border-black p-1 bg-teal-800 text-yellow-300">total kW</td>
                  <td className="border border-black p-1 bg-teal-800 text-yellow-300">kW/ton</td>
                  <td colSpan={9} className="border border-none p-1"></td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td colSpan={PDF_COLUMNS.length + 1} className="border border-none p-1 text-right"></td>
                  <td className="border border-black p-1 bg-teal-600">{totals.totalTons.toFixed(0)}</td>
                  <td className="border border-black p-1 bg-teal-600">{totals.totalKwh.toFixed(1)}</td>
                  <td className="border border-black p-1 bg-teal-600">{totals.ave > 0 ? totals.ave.toFixed(3) : '#DIV/0!'}</td>
                  <td colSpan={9} className="border border-none p-1"></td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-8">
              <h2 className="font-bold bg-sky-500 text-white inline-block px-4 py-1 mb-4" style={{ fontSize: '14px' }}>BIỂU ĐỒ SO SÁNH GIỮA CÁC THÁNG</h2>
              <div className="flex gap-4">
                <table className="border-collapse border border-black text-center" style={{ fontSize: '13px', alignSelf: 'flex-start' }}>
                  <tbody>
                    <tr className="bg-green-600 text-white font-bold">
                      <td className="border border-black p-1">THÁNG</td>
                      {chartData.map(d => <td key={d.month} className="border border-black p-1 min-w-[40px]">{d.month}</td>)}
                    </tr>
                    <tr className="bg-green-200 font-bold">
                      <td className="border border-black p-1">KWH/TON</td>
                      {chartData.map(d => <td key={d.month} className="border border-black p-1">{d.val > 0 ? d.val.toFixed(3) : ''}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 border border-black p-4 w-[600px] h-[300px]">
                <h3 className="text-center font-bold text-white bg-teal-800 mb-2 py-1" style={{ fontSize: '14px' }}>SO SÁNH ĐIỆN NHẬP HÀNG GIỮA CÁC THÁNG</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: '11px' }} />
                    <YAxis style={{ fontSize: '11px' }} domain={[0, 1]} tickCount={11} />
                    <Bar dataKey="val" fill="#c0504d" barSize={20}>
                      <LabelList dataKey="val" position="top" style={{ fontSize: '10px' }} formatter={(val: number) => val > 0 ? val.toFixed(3) : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8 flex justify-around w-[600px] font-bold" style={{ fontSize: '13px' }}>
                <div className="text-center">
                  <p>Người Lập</p>
                  <p className="mt-16">Mr Lê Văn Lộc</p>
                </div>
                <div className="text-center">
                  <p>Người Duyệt</p>
                  <p className="mt-16">Mr TẠ MINH ÁNH</p>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
