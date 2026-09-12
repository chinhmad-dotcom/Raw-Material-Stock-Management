import React, { useState, useEffect } from 'react';
import { fumigationApi, FumigationLog } from '../../api/fumigationApi';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2, ShieldAlert, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TARGET_SILOS = [
  '21', '22', '23', '24', 
  '301', '302', '303', '304', '305', '306',
  'D301', 'D302', 'D303', 'D304', 'D305', 'D306'
];

export default function FumigationReport() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<FumigationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Form states
  const [siloCode, setSiloCode] = useState(TARGET_SILOS[0]);
  const [materialName, setMaterialName] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await fumigationApi.getAll();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setError('Lỗi tải dữ liệu báo cáo phun trùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || !weightKg || !startDate || !endDate) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
      return;
    }

    setSubmitting(true);
    try {
      await fumigationApi.create({
        siloCode,
        materialName,
        weightKg: Number(weightKg),
        startDate,
        endDate
      });
      
      setMaterialName('');
      setWeightKg('');
      setStartDate('');
      setEndDate('');
      
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu dữ liệu!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;
    try {
      await fumigationApi.delete(id);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert('Lỗi xóa bản ghi!');
    }
  };

  const isCurrentlyFumigating = (start: string, end: string) => {
    const now = new Date().toISOString().split('T')[0];
    return now >= start && now <= end;
  };

  const handleExportPDF = async () => {
    const tableElement = document.getElementById('fumigation-table');
    if (!tableElement) return;

    setExporting(true);
    try {
      // Temporary hide action columns for clean PDF
      tableElement.classList.add('exporting-pdf');
      
      const canvas = await html2canvas(tableElement, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      tableElement.classList.remove('exporting-pdf');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFont("times", "bold");
      pdf.setFontSize(14);
      pdf.text('BÁO CÁO PHUN KHỬ TRÙNG (FUMIGATION REPORT)', 14, 15);
      
      pdf.setFont("times", "normal");
      pdf.setFontSize(13);
      pdf.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, 14, 22);

      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_Phun_Trung_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Đã xảy ra lỗi khi tạo file PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        .exporting-pdf .action-column {
          display: none !important;
        }
        .exporting-pdf, .exporting-pdf * {
          font-family: "Times New Roman", Times, serif !important;
          font-size: 13pt !important;
        }
      `}</style>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Ghi nhận thông tin phun trùng
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên bồn (Silo)</label>
            <select 
              value={siloCode} 
              onChange={(e) => setSiloCode(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            >
              {TARGET_SILOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên nguyên liệu</label>
            <input 
              type="text" 
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="VD: Corn (USA)"
              className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Khối lượng (Kg)</label>
            <input 
              type="number" 
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              min="0"
              className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày bắt đầu phun</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày kết thúc</label>
            <div className="flex items-center gap-2 h-full">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="h-[42px] px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-70 transition-colors"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Nhật ký phun trùng</h3>
          <button 
            onClick={handleExportPDF}
            disabled={exporting || logs.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Xuất PDF
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-500 font-medium">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu phun trùng</div>
        ) : (
          <div className="overflow-x-auto" id="fumigation-table">
            <table className="w-full text-left text-sm bg-white dark:bg-slate-900">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tên bồn</th>
                  <th className="px-4 py-3 font-semibold">Nguyên liệu</th>
                  <th className="px-4 py-3 font-semibold text-right">Khối lượng (Kg)</th>
                  <th className="px-4 py-3 font-semibold text-center">Thời gian phun</th>
                  <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-center action-column">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map(log => {
                  const active = isCurrentlyFumigating(log.startDate, log.endDate);
                  const past = new Date() > new Date(log.endDate);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{log.siloCode}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.materialName}</td>
                      <td className="px-4 py-3 font-mono text-right text-slate-700 dark:text-slate-300">{log.weightKg.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                        {log.startDate} <span className="text-slate-400 mx-1">→</span> {log.endDate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {active ? (
                          <span className="inline-flex px-2 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full border border-rose-200 dark:border-rose-500/30 animate-pulse">
                            Đang phun trùng
                          </span>
                        ) : past ? (
                          <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
                            Đã hoàn thành
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">
                            Sắp tới
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center action-column">
                        <button 
                          onClick={() => log.id && handleDelete(log.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
