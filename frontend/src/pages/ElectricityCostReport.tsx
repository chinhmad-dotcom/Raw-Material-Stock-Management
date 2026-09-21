import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMenu } from '../components/layout/UserMenu';
import { FileText, Loader2, Save, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  { label: 'CORN #ARG', match: ['Corn (ARG#A,#B)'] },
  { label: 'CORN #BRA', match: [] },
  { label: 'WG', match: ['Feed Wheat (UKARAINE, Australia, ARGENTINA, Brazil)'] },
  { label: 'RBF', match: ['RBF, Rice Bran Fresh (S), Rice bran fresh (Premium)'] },
  { label: 'BR', match: ['Broken Rice #C,#B'] },
  { label: 'DDGS', match: ['DDGS, DDGS-pro-26'] },
  { label: 'PKM', match: ['Palm kernel Expeller'] },
  { label: 'TBP', match: ['Tap By Product Fine, Tapioca by product - special (local)'] },
  { label: 'SBM', match: ['Soy Bean Meal -Ex-WH (Local)', 'F.F Soy Bean Meal'] },
  { label: 'COM', match: ['Corn Extrude'] },
  { label: 'CORN #USA', match: [] },
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
  const [yearlyData, setYearlyData] = useState<{month: string, val: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, yearRes] = await Promise.all([
        fetch(`http://localhost:5147/api/reports/electricity-cost?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`http://localhost:5147/api/reports/electricity-cost-yearly?year=${selectedYear}`)
      ]);
      const json = await res.json();
      const yearJson = await yearRes.json();
      
      if (json.data) setData(json.data);
      if (yearJson.data) setYearlyData(yearJson.data);
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
    }).finally(() => {
      setSaving(false);
      fetchData(); // reload chart data
    });
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Electricity Cost Report');

    // Add Title
    worksheet.mergeCells('A1:AC1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BÁO CÁO NHẬP HÀNG HẰNG NGÀY';
    titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF0000FF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Headers Row 1
    const headers1 = ['DATE', ...PDF_COLUMNS.map(c => c.label), 'TOTAL', 'TOTAL', 'AVE', 'MCC13', '', '', 'MCC11', '', '', 'MCC12', '', ''];
    const row2 = worksheet.addRow(headers1);
    row2.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    row2.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    worksheet.mergeCells('A2:A3'); // DATE
    worksheet.mergeCells('V2:X2'); // MCC13
    worksheet.mergeCells('Y2:AA2'); // MCC11
    worksheet.mergeCells('AB2:AD2'); // MCC12

    // Headers Row 2
    const headers2 = [''];
    PDF_COLUMNS.forEach(() => headers2.push('TONS'));
    headers2.push('TONS', 'KWH', 'KWH/TONS', 'E BEFORE', 'E AFTER', 'total', 'E BEFORE', 'E AFTER', 'total', 'E BEFORE', 'E AFTER', 'TOTAL');
    const row3 = worksheet.addRow(headers2);
    row3.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    row3.eachCell((cell, colNum) => {
      if(colNum > 1) { // Skip A3 since it's merged
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
    });

    // Data rows
    tableRows.forEach(row => {
      const rowData = [row.date];
      PDF_COLUMNS.forEach(c => rowData.push(row.mappedMaterials[c.label] || 0));
      rowData.push(row.totalTons, row.totalKwh, row.ave > 0 ? row.ave : '#DIV/0!');
      rowData.push(row.energy.mcc13.before, row.energy.mcc13.after, row.energy.mcc13.used);
      rowData.push(row.energy.mcc11.before, row.energy.mcc11.after, row.energy.mcc11.used);
      rowData.push(row.energy.mcc12.before, row.energy.mcc12.after, row.energy.mcc12.used);
      
      const exRow = worksheet.addRow(rowData);
      exRow.font = { name: 'Times New Roman', size: 11 };
      exRow.eachCell(cell => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // Total Row
    const tRow1 = [''];
    PDF_COLUMNS.forEach(c => tRow1.push(totals.materials[c.label] || 0));
    tRow1.push(totals.totalTons, totals.totalKwh, '', '', '', '', '', '', '', '', '', '');
    const exTRow1 = worksheet.addRow(tRow1);
    exTRow1.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    exTRow1.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Electricity_Cost_Report_${selectedYear}_${selectedMonth}.xlsx`);
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
          if (row.materials[mName]) sum += row.materials[mName] / 1000;
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
  const chartData = yearlyData.length === 12 ? [...yearlyData] : [
    { month: '1', val: 0 }, { month: '2', val: 0 }, { month: '3', val: 0 },
    { month: '4', val: 0 }, { month: '5', val: 0 }, { month: '6', val: 0 },
    { month: '7', val: 0 }, { month: '8', val: 0 }, { month: '9', val: 0 },
    { month: '10', val: 0 }, { month: '11', val: 0 }, { month: '12', val: 0 }
  ];
  
  // Make sure current month is updated instantly if manual remove changes
  chartData[selectedMonth - 1] = { month: selectedMonth.toString(), val: totals.ave };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 p-2 md:p-4">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-50">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Báo cáo chi phí điện</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end">
          <select 
            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 text-sm"
            value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
          </select>
          <select 
            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 text-sm"
            value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          
          {saving && <span className="text-xs text-slate-500 flex items-center gap-1"><Save className="w-3 h-3 animate-pulse"/> Đang lưu...</span>}
          <UserMenu />
        </div>
      </div>

      <div className="flex-1 bg-white overflow-auto border border-slate-300 shadow-sm rounded-lg" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="p-2 w-full overflow-x-auto">
            <div className="text-center mb-4">
              <h1 className="font-bold text-blue-800 uppercase" style={{ fontSize: '18px' }}>BÁO CÁO NHẬP HÀNG HẰNG NGÀY</h1>
            </div>
            
            <table ref={tableRef} className="w-full border-collapse border border-black text-center mx-auto" style={{ fontSize: '12px', minWidth: '1000px', tableLayout: 'auto' }}>
              <thead>
                <tr className="bg-sky-500 text-white font-bold" style={{ fontSize: '12px' }}>
                  <th className="border border-black p-0.5" rowSpan={2}>DATE</th>
                  {PDF_COLUMNS.map(c => <th key={c.label} className="border border-black p-0.5 px-1 min-w-[35px] max-w-[50px] break-words whitespace-normal leading-tight">{c.label}</th>)}
                  <th className="border border-black p-0.5 whitespace-nowrap px-1">TOTAL</th>
                  <th className="border border-black p-0.5 whitespace-nowrap px-1">TOTAL</th>
                  <th className="border border-black p-0.5 whitespace-nowrap px-1">AVE</th>
                  <th className="border border-black p-0.5 whitespace-nowrap px-1" colSpan={3}>MCC13</th>
                  <th className="border border-black p-0.5 whitespace-nowrap px-1" colSpan={3}>MCC11</th>
                  <th className="border border-black p-0.5 whitespace-nowrap px-1" colSpan={3}>MCC12</th>
                </tr>
                <tr className="bg-sky-500 text-white font-bold" style={{ fontSize: '11px' }}>
                  {PDF_COLUMNS.map(c => <th key={c.label} className="border border-black p-0.5 font-normal">TONS</th>)}
                  <th className="border border-black p-0.5 font-normal px-1">TONS</th>
                  <th className="border border-black p-0.5 font-normal px-1">KWH</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">KWH<br/>/TONS</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>BEFORE</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>AFTER</th>
                  <th className="border border-black p-0.5 font-normal px-1">total</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>BEFORE</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>AFTER</th>
                  <th className="border border-black p-0.5 font-normal px-1">total</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>BEFORE</th>
                  <th className="border border-black p-0.5 font-normal px-1 leading-tight">E<br/>AFTER</th>
                  <th className="border border-black p-0.5 font-normal px-1">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="border border-black p-0.5 whitespace-nowrap text-[11px] px-1">{row.date}</td>
                    {PDF_COLUMNS.map(c => (
                      <td key={c.label} className="border border-black p-0.5 min-w-[30px] max-w-[40px]">
                        {c.isEditable ? (
                          <input 
                            type="number"
                            className="w-full text-center bg-transparent border-none outline-none focus:bg-yellow-100 px-0"
                            value={row.mappedMaterials[c.label] || ''}
                            onChange={(e) => handleRemoveChange(row.date, e.target.value)}
                          />
                        ) : (
                          row.mappedMaterials[c.label] > 0 ? row.mappedMaterials[c.label].toFixed(0) : '0'
                        )}
                      </td>
                    ))}
                    <td className="border border-black p-0.5 bg-white font-bold">{row.totalTons.toFixed(0)}</td>
                    <td className="border border-black p-0.5 bg-white font-bold">{row.totalKwh.toFixed(0)}</td>
                    <td className="border border-black p-0.5 bg-white">{row.ave > 0 ? row.ave.toFixed(3) : '#DIV/0!'}</td>
                    
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc13.before}</td>
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc13.after}</td>
                    <td className="border border-black p-0.5 bg-teal-200">{row.energy.mcc13.used}</td>
                    
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc11.before}</td>
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc11.after}</td>
                    <td className="border border-black p-0.5 bg-teal-200">{row.energy.mcc11.used}</td>
                    
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc12.before}</td>
                    <td className="border border-black p-0.5 bg-teal-100">{row.energy.mcc12.after}</td>
                    <td className="border border-black p-0.5 bg-teal-200">{row.energy.mcc12.used}</td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-green-500 text-white font-bold">
                  <td className="border border-black p-0.5"></td>
                  {PDF_COLUMNS.map(c => (
                    <td key={c.label} className="border border-black p-0.5">{totals.materials[c.label] > 0 ? totals.materials[c.label].toFixed(0) : '0'}</td>
                  ))}
                  <td className="border border-black p-0.5">{totals.totalTons.toFixed(0)}</td>
                  <td className="border border-black p-0.5">{totals.totalKwh.toFixed(0)}</td>
                  <td className="border border-black p-0.5"></td>
                  <td colSpan={9} className="border border-black p-0.5"></td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td colSpan={PDF_COLUMNS.length + 1} className="border border-none p-0.5 text-right"></td>
                  <td className="border border-black p-0.5 bg-teal-800 text-yellow-300">total tons</td>
                  <td className="border border-black p-0.5 bg-teal-800 text-yellow-300">total kW</td>
                  <td className="border border-black p-0.5 bg-teal-800 text-yellow-300">kW/ton</td>
                  <td colSpan={9} className="border border-none p-0.5"></td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td colSpan={PDF_COLUMNS.length + 1} className="border border-none p-0.5 text-right"></td>
                  <td className="border border-black p-0.5 bg-teal-600">{totals.totalTons.toFixed(0)}</td>
                  <td className="border border-black p-0.5 bg-teal-600">{totals.totalKwh.toFixed(1)}</td>
                  <td className="border border-black p-0.5 bg-teal-600">{totals.ave > 0 ? totals.ave.toFixed(3) : '#DIV/0!'}</td>
                  <td colSpan={9} className="border border-none p-0.5"></td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-8 mb-8 flex flex-col items-center">
              <h2 className="font-bold bg-sky-500 text-white inline-block px-4 py-1 mb-4" style={{ fontSize: '14px' }}>BIỂU ĐỒ SO SÁNH GIỮA CÁC THÁNG</h2>
              <div className="flex gap-4 w-full max-w-[800px] justify-center">
                <table className="border-collapse border border-black text-center mx-auto" style={{ fontSize: '12px', alignSelf: 'flex-start' }}>
                  <tbody>
                    <tr className="bg-green-600 text-white font-bold">
                      <td className="border border-black p-1">THÁNG</td>
                      {chartData.map(d => <td key={d.month} className="border border-black p-1 min-w-[30px]">{d.month}</td>)}
                    </tr>
                    <tr className="bg-green-200 font-bold">
                      <td className="border border-black p-1">KWH/TON</td>
                      {chartData.map(d => <td key={d.month} className="border border-black p-1">{d.val > 0 ? d.val.toFixed(3) : ''}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 border border-black p-4 w-full max-w-[800px] h-[300px]">
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
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
