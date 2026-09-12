import { useTranslation } from 'react-i18next';
﻿import { useState, useEffect } from 'react';
import { Loader2, Edit2, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface SiloConfig {
  id?: string;
  siloCode: string;
  materialName?: string;
  maxCapacity: number;
  color?: string;
  isHidden?: boolean;
}

interface MergedLocation {
  siloCode: string;
  materialName: string;
  groupType: 'Silo' | 'Liquid' | 'Phụ gia';
  configId?: string;
  maxCapacity: number | null;
  color: string | null;
}

export function SiloTab() {
  const { t } = useTranslation();


  const [locations, setLocations] = useState<MergedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MergedLocation | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<SiloConfig>();

  
  const deleteLocation = async (item: MergedLocation) => {
    if (confirm(`Bạn có chắc chắn muốn xóa (ẩn) ${item.siloCode} chứa ${item.materialName} không?\n(Thao tác này sẽ loại bỏ dữ liệu sai thực tế từ file Excel khỏi hệ thống)`)) {
      try {
        const payload = {
          siloCode: item.siloCode,
          materialName: item.materialName,
          isHidden: true
        };
        await fetch(`http://localhost:5147/api/settings/silos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        fetchData();
      } catch (error) {
        console.error('Lỗi xóa location:', error);
      }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, configRes] = await Promise.all([
        fetch('http://localhost:5147/api/dashboard/summary'),
        fetch('http://localhost:5147/api/settings/silos')
      ]);
      const summaryData = await summaryRes.json();
      const configs: SiloConfig[] = await configRes.json();

      const merged: MergedLocation[] = [];

      // Process Silos from Excel
      summaryData.silos?.forEach((s: any) => {
        const hideRule = configs.find(c => c.siloCode === s.siloCode && c.materialName === s.materialName && c.isHidden);
        if (hideRule) return;

        const conf = configs.find(c => c.siloCode === s.siloCode && !c.isHidden);
        merged.push({
          siloCode: s.siloCode,
          materialName: s.materialName,
          groupType: 'Silo',
          configId: conf?.id,
          maxCapacity: conf ? conf.maxCapacity : null,
          color: conf?.color || '#3b82f6', // Default blue
        });
      });

      // Process Additives (including Liquid) from Excel
      summaryData.additives?.forEach((a: any) => {
        const siloCode = a.warehouseLocation || 'WH';
        const groupType = a.groupType === 'Liquid' ? 'Liquid' : 'Phụ gia';
        
        if (groupType === 'Phụ gia') {
            const existingLoc = merged.find(m => m.siloCode === siloCode && m.groupType === 'Phụ gia');
            if (existingLoc) {
                if (!existingLoc.materialName.includes(a.materialName)) {
                    existingLoc.materialName += `, ${a.materialName}`;
                }
                return;
            }
        }

        const conf = configs.find(c => c.siloCode === siloCode && !c.isHidden);
        merged.push({
          siloCode: siloCode,
          materialName: a.materialName,
          groupType: groupType,
          configId: conf?.id,
          maxCapacity: conf ? conf.maxCapacity : null,
          color: conf?.color || '#10b981', // Default green
        });
      });

  // Sắp xếp theo thứ tự ABC, có hỗ trợ sort số (numeric: true) để wb2 đứng trước wb10
      merged.sort((a, b) => (a.siloCode || '').localeCompare(b.siloCode || '', undefined, { numeric: true }));

      setLocations(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item: MergedLocation) => {
    setEditingItem(item);
    setValue('siloCode', item.siloCode);
    setValue('maxCapacity', item.maxCapacity || 0);
    setValue('color', item.color || '#3b82f6'); 
    if (item.configId) {
      setValue('id', item.configId);
    } else {
      setValue('id', undefined);
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SiloConfig) => {
    data.maxCapacity = Number(data.maxCapacity);
    
    await fetch('http://localhost:5147/api/settings/silos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const renderTable = (groupType: 'Silo' | 'Liquid' | 'Phụ gia', title: string) => {
    const data = locations.filter(l => l.groupType === groupType);
    if (data.length === 0) return null;

    const showCapacity = groupType !== 'Phụ gia';

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
        <div className="bg-slate-50 dark:bg-slate-900 px-3 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-bold tracking-wide text-sky-400 uppercase">{title} ({data.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300">
            <thead className="sticky top-0 bg-slate-950/90 z-10 uppercase tracking-wider backdrop-blur">
              <tr>
                <th className="px-2 py-2 font-medium">{t('tabs.silo.loc', 'Loc')}</th>
                <th className="px-2 py-2 font-medium">{t('tabs.silo.material', 'Material')}</th>
                {showCapacity && <th className="px-2 py-2 font-medium text-right">Max (T)</th>}
                <th className="px-2 py-2 font-medium text-center">{t('tabs.silo.color', 'Color')}</th>
                <th className="px-2 py-2 text-right font-medium">{t('tabs.silo.act', 'Act')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {data.map((item, idx) => (
                <tr key={`${item.siloCode}-${item.materialName}-${idx}`} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/30">
                  <td className="px-2 py-2 font-bold text-slate-800 dark:text-slate-200">{item.siloCode}</td>
                  <td className="px-2 py-2 truncate max-w-[80px]" title={item.materialName}>{item.materialName}</td>
                  {showCapacity && (
                    <td className="px-2 py-2 text-right font-mono">
                      {item.maxCapacity !== null ? item.maxCapacity.toLocaleString() : <span className="text-slate-500 dark:text-slate-500">-</span>}
                    </td>
                  )}
                  <td className="px-2 py-2 text-center flex justify-center">
                    {item.color ? (
                      <div className="h-4 w-4 rounded shadow-sm border border-white/20" style={{ backgroundColor: item.color }} title={item.color}></div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openModal(item)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-emerald-500 transition-colors" title="Chỉnh sửa"><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => deleteLocation(item)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors" title="Xóa cấu hình"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 overflow-hidden pr-1">
        {renderTable('Silo', 'SILO (RAW MATERIALS)')}
        {renderTable('Liquid', 'LIQUID TANKS')}
        {renderTable('Phụ gia', 'ADDITIVES WAREHOUSE')}
      </div>

      {isModalOpen && editingItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Cấu hình: {editingItem.siloCode}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"><X className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('id')} />
              <input type="hidden" {...register('siloCode')} />
              
              <div className="mb-2 p-3 bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                <p className="text-xs text-slate-600 dark:text-slate-400">{t('tabs.silo.currMat', 'Nguyên liệu hiện tại:')}</p>
                <p className="text-sm font-semibold text-emerald-400">{editingItem.materialName}</p>
              </div>

              {editingItem.groupType !== 'Phụ gia' && (
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Max Capacity (Tons)</label>
                  <input {...register('maxCapacity', { required: true })} type="number" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tabs.silo.siloColor', 'Silo Color')}</label>
                <div className="mt-1 flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2">
                  <input {...register('color')} type="color" className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{t('tabs.silo.hex', 'Choose Hex Color')}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">{t('tabs.silo.save', 'Save Config')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



