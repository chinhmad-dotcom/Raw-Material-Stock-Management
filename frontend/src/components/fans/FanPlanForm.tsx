import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { calculateFanHours } from './fanUtils';
import { fanApi, FanRecord } from '../../api/fanApi';
import { Save, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

interface FanPlanFormProps {
  onSuccess: () => void;
}

const SILO_OPTIONS = ['21', '22', '23', '24', '301', '302', '303', '304', '305', '306'];
const REASON_OPTIONS = ['Định kỳ', 'Hot spot', 'Nhập mới nguyên liệu'];

export default function FanPlanForm({ onSuccess }: FanPlanFormProps) {
  const { t } = useTranslation();


  const [formData, setFormData] = useState({
    siloName: '304',
    reason: 'Định kỳ',
    volumeTons: '',
    planStart: '',
    actualStart: '',
    actualEnd: '',
    actualTotalHours: '',
    staffOpen: '',
    staffClose: '',
    inspectorSilo: '',
    inspectorLab: '',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  // 1. Set default times to 8:00 AM
  useEffect(() => {
    const now = new Date();
    now.setHours(8, 0, 0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const iso8am = now.toISOString().slice(0, 16);
    setFormData(prev => ({ 
      ...prev, 
      planStart: iso8am,
      actualStart: iso8am,
      actualEnd: iso8am
    }));
  }, []);

  const totalHoursRegulated = calculateFanHours(formData.siloName, Number(formData.volumeTons) || 0);

  // 2. Auto calculate End Time & Round to 8:00 AM
  const planEnd = React.useMemo(() => {
    if (!formData.planStart || !totalHoursRegulated) return '';
    const start = new Date(formData.planStart);
    const end = new Date(start.getTime() + totalHoursRegulated * 3600000);
    
    if (end.getHours() > 8 || (end.getHours() === 8 && end.getMinutes() > 0)) {
      end.setDate(end.getDate() + 1);
    }
    end.setHours(8, 0, 0, 0);
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    return end.toISOString().slice(0, 16);
  }, [formData.planStart, totalHoursRegulated]);

  // 3. Auto calculate Actual Total Hours
  useEffect(() => {
    if (formData.actualStart && formData.actualEnd) {
      const start = new Date(formData.actualStart).getTime();
      const end = new Date(formData.actualEnd).getTime();
      if (end > start) {
        const diffHrs = (end - start) / 3600000;
        setFormData(prev => ({ ...prev, actualTotalHours: diffHrs.toFixed(1) }));
      } else {
        setFormData(prev => ({ ...prev, actualTotalHours: '0' }));
      }
    }
  }, [formData.actualStart, formData.actualEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.volumeTons || Number(formData.volumeTons) <= 0) {
      setError('Vui lòng nhập số lượng (tấn) hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const record: FanRecord = {
        siloName: formData.siloName,
        reason: formData.reason,
        volumeTons: Number(formData.volumeTons),
        totalHoursRegulated,
        planStart: new Date(formData.planStart).toISOString(),
        planEnd: new Date(planEnd).toISOString(),
        planTotalHours: totalHoursRegulated,
        // Only save actual times if total hours > 0 or if user explicitly typed a note/staff meaning it's a real run
        actualStart: (Number(formData.actualTotalHours) > 0 || formData.staffOpen) ? new Date(formData.actualStart).toISOString() : null,
        actualEnd: (Number(formData.actualTotalHours) > 0 || formData.staffClose) ? new Date(formData.actualEnd).toISOString() : null,
        actualTotalHours: (Number(formData.actualTotalHours) > 0 || formData.staffOpen) ? Number(formData.actualTotalHours) : null,
        staffOpen: formData.staffOpen,
        staffClose: formData.staffClose,
        inspectorSilo: formData.inspectorSilo,
        inspectorLab: formData.inspectorLab,
        note: formData.note,
        status: 'pending'
      };
      
      await fanApi.saveFan(record);
      // Reset form (keep 8am defaults)
      const now = new Date();
      now.setHours(8, 0, 0, 0);
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const iso8am = now.toISOString().slice(0, 16);

      setFormData(prev => ({ 
        ...prev, 
        volumeTons: '', 
        actualStart: iso8am, 
        actualEnd: iso8am, 
        actualTotalHours: '0', 
        staffOpen: '', 
        staffClose: '', 
        inspectorSilo: '', 
        inspectorLab: '', 
        note: '' 
      }));
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded bg-white dark:bg-slate-800 text-sm px-2 py-1 text-black dark:text-white h-8 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 outline-none";
  const labelClass = "block text-xs font-bold text-black dark:text-white mb-0.5 uppercase tracking-tighter truncate";

  return (
    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
           <h2 className="text-lg font-bold text-black dark:text-white">{t('fan.form.title', 'Kế Hoạch Mở Quạt')}</h2>
           {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>

      </div>
      
      <form onSubmit={handleSubmit} className="space-y-1.5">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5">
            <div>
              <label className={labelClass}>{t('fan.form.silo', 'Silo')}</label>
              <select value={formData.siloName} onChange={e => setFormData({ ...formData, siloName: e.target.value })} className={inputClass}>
                {SILO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.reason', 'Lý do')}</label>
              <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className={inputClass}>
                {REASON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.tons', 'Tấn')}</label>
              <input type="number" value={formData.volumeTons} onChange={e => setFormData({ ...formData, volumeTons: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.reqHrs', 'Giờ Quy Định')}</label>
              <input type="text" readOnly value={totalHoursRegulated ? totalHoursRegulated + ' h' : '0 h'} className={inputClass + " bg-slate-100 dark:bg-slate-700 font-bold text-black dark:text-white"} />
            </div>
            <div>
              <label className={labelClass}>Mở (K.Hoạch)</label>
              <input type="datetime-local" value={formData.planStart} onChange={e => setFormData({ ...formData, planStart: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tắt (K.Hoạch 8h)</label>
              <input type="datetime-local" readOnly value={planEnd} className={inputClass + " bg-slate-100 dark:bg-slate-700"} />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-1.5">
            <div>
              <label className={labelClass}>{t('fan.form.actStart', 'T.Tế Mở')}</label>
              <input type="datetime-local" value={formData.actualStart} onChange={e => setFormData({ ...formData, actualStart: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.actEnd', 'T.Tế Tắt')}</label>
              <input type="datetime-local" value={formData.actualEnd} onChange={e => setFormData({ ...formData, actualEnd: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>T.Gian Thực(h)</label>
              <input type="number" readOnly value={formData.actualTotalHours} className={inputClass + " bg-slate-100 dark:bg-slate-700 font-bold"} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.startedBy', 'NV Mở')}</label>
              <input type="text" value={formData.staffOpen} onChange={e => setFormData({ ...formData, staffOpen: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.endedBy', 'NV Tắt')}</label>
              <input type="text" value={formData.staffClose} onChange={e => setFormData({ ...formData, staffClose: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.qcSilo', 'KT Silo')}</label>
              <input type="text" value={formData.inspectorSilo} onChange={e => setFormData({ ...formData, inspectorSilo: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.qcLab', 'KT Lab')}</label>
              <input type="text" value={formData.inspectorLab} onChange={e => setFormData({ ...formData, inspectorLab: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('fan.form.notes', 'Ghi chú')}</label>
              <input type="text" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Kế Hoạch
          </button>
        </div>
      </form>
    </div>
  );
}
