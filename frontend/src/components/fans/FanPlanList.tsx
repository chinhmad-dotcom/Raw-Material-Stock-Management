import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { fanApi, FanRecord } from '../../api/fanApi';
import { generateFanPdf } from './fanPdfGenerator';
import { Download, Edit2, Trash2, CheckCircle, Eye, X } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

export default function FanPlanList() {
  const { t } = useTranslation();


  const [records, setRecords] = useState<FanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSilo, setFilterSilo] = useState('304');
  
  // Month filter initialized to current month
  const currentYearStr = new Date().getFullYear().toString();
  const [filterYear, setFilterYear] = useState(currentYearStr);
  
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isManager = user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'admin';

  const fetchRecords = async () => {
    try {
      const data = await fanApi.getFans();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 10000); 
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = records.filter(r => {
    const rYear = r.planStart ? new Date(r.planStart).getFullYear().toString() : '';
    return r.siloName === filterSilo && rYear === filterYear;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return;
    try {
      await fanApi.deleteFan(id);
      fetchRecords();
    } catch (err) {
      alert('Lỗi khi xóa!');
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.id) return;
    const signature = localStorage.getItem('userSignature_' + user.id);
    if (!signature) {
      alert('Bạn chưa upload chữ ký. Vui lòng vào Settings -> My Profile để upload chữ ký trước khi duyệt.');
      return;
    }
    
    if (!window.confirm('Xác nhận duyệt báo cáo này?')) return;
    try {
      await fanApi.approveFan(id, signature, user.name);
      fetchRecords();
      alert('Đã duyệt thành công!');
    } catch (err) {
      alert('Lỗi khi duyệt!');
    }
  };

  const handlePreviewPdf = () => {
    const doc = generateFanPdf(filterSilo, filteredRecords);
    const pdfUrl = doc.output('datauristring') as any as string;
    setPdfPreviewUrl(pdfUrl);
  };

  const handleExportPdf = () => {
    const doc = generateFanPdf(filterSilo, filteredRecords);
    doc.save('Ke_hoach_mo_quat_Silo_' + filterSilo + '_' + new Date().getTime() + '.pdf');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mt-4 relative">
      <div className="flex items-center justify-between mb-2 p-2">
        <h2 className="text-lg font-bold text-black dark:text-white">{t('fan.list.title', 'Danh sách & Báo cáo')}</h2>
        
        <div className="flex gap-2 items-center">
          <input 
            type="number" 
            min="2020" max="2100" step="1"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2 py-1 border outline-none w-[70px]"
          />
          <select 
            value={filterSilo}
            onChange={e => setFilterSilo(e.target.value)}
            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2 py-1 border outline-none"
          >
            {['21', '22', '23', '24', '301', '302', '303', '304', '305', '306'].map(opt => <option key={opt} value={opt}>Silo {opt}</option>)}
          </select>
          
          <button 
            onClick={handlePreviewPdf}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            <Eye className="w-3 h-3" />{t('fan.list.preview', 'Xem Trước')}</button>
          
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3" />{t('fan.list.pdf', 'Tải PDF')}</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-black dark:text-white text-left whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-800 text-black dark:text-white font-bold text-xs uppercase">
            <tr>
              <th className="px-2 py-1.5 border dark:border-slate-700" rowSpan={2}>{t('fan.form.reason', 'Lý do')}</th>
              <th className="px-2 py-1.5 border dark:border-slate-700" rowSpan={2}>{t('fan.form.tons', 'Tấn')}</th>
              <th className="px-2 py-1.5 border dark:border-slate-700" rowSpan={2}>H (QĐ)</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-center text-black dark:text-white" colSpan={2}>{t('fan.list.plan', 'Kế Hoạch')}</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-center text-black dark:text-white font-bold" colSpan={3}>{t('fan.list.actual', 'Thực Tế')}</th>
              <th className="px-2 py-1.5 border dark:border-slate-700 text-center w-[70px]" rowSpan={2}>{t('fan.list.st', 'TT')}</th>
              <th className="px-2 py-1.5 border dark:border-slate-700 text-center w-[80px]" rowSpan={2}>{t('fan.list.act', 'T.Tác')}</th>
            </tr>
            <tr>
              <th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white">{t('fan.list.on', 'Mở')}</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white">{t('fan.list.off', 'Tắt')}</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white font-bold">{t('fan.list.on', 'Mở')}</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white font-bold">{t('fan.list.off', 'Tắt')}</th>
              <th className="px-2 py-1 border dark:border-slate-700 text-black dark:text-white font-bold">{t('fan.list.h', 'H')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-4 text-xs">{t('fan.list.loading', 'Đang tải...')}</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-4 text-xs">{t('fan.list.nodata', 'Chưa có dữ liệu cho năm và bồn này')}</td></tr>
            ) : (
              filteredRecords.map((r, idx) => (
                <tr key={r.id || idx} className="text-black dark:text-white font-medium border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-2 py-1.5 border-r dark:border-slate-700 truncate max-w-[100px]">{r.reason}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700 font-bold">{r.volumeTons}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700">{r.totalHoursRegulated}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700">{new Date(r.planStart).toLocaleString('vi-VN')}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700">{new Date(r.planEnd).toLocaleString('vi-VN')}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700">{r.actualStart ? new Date(r.actualStart).toLocaleString('vi-VN') : ''}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700">{r.actualEnd ? new Date(r.actualEnd).toLocaleString('vi-VN') : ''}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700 font-bold">{r.actualTotalHours || ''}</td>
                  <td className="px-2 py-1.5 border-r dark:border-slate-700 text-center w-[70px]">
                    {r.status === 'approved' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase text-[9px] font-bold">{t('fan.list.approved', 'Đã duyệt')}</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase text-[9px] font-bold">{t('fan.list.pending', 'Chờ duyệt')}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 flex gap-4 justify-center items-center h-full min-h-[36px] w-[80px]">
                    {r.status !== 'approved' && isManager && (
                      <button onClick={() => handleApprove(r.id!)} title="Duyệt" className="text-emerald-500 hover:text-emerald-700">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id!)} title="Xóa" className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Xem trước PDF - Silo {filterSilo}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const doc = generateFanPdf(filterSilo, filteredRecords);
                    doc.save('Ke_hoach_mo_quat_Silo_' + filterSilo + '_' + new Date().getTime() + '.pdf');
                  }}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />{t('fan.list.download', 'Tải xuống')}</button>
                <button 
                  onClick={() => setPdfPreviewUrl(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-800">
              <iframe src={pdfPreviewUrl} className="w-full h-full border-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
