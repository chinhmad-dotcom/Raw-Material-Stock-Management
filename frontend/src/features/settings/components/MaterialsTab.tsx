import { useTranslation } from 'react-i18next';
﻿import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Material {
  id: string;
  sku: string;
  name: string;
  unit: string;
  density: number;
  maxStorageAgeDays: number;
  dohThreshold: number;
  color?: string;
}
type MaterialFormData = Omit<Material, 'id'>;

export function MaterialsTab() {
  const { t } = useTranslation();


  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Material | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<MaterialFormData>();

  const fetchData = () => {
    fetch('http://localhost:5147/api/settings/materials')
      .then(res => res.json())
      .then(data => { setMaterials(data); setIsLoading(false); })
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item?: Material) => {
    if (item) {
      setEditingItem(item);
      setValue('sku', item.sku);
      setValue('name', item.name);
      setValue('unit', item.unit);
      setValue('density', item.density);
      setValue('maxStorageAgeDays', item.maxStorageAgeDays || 90);
      setValue('dohThreshold', item.dohThreshold || 5);
    } else {
      setEditingItem(null);
      reset({ sku: '', name: '', unit: 'Ton', density: 0.7, maxStorageAgeDays: 90, dohThreshold: 5 });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MaterialFormData) => {
    const url = 'http://localhost:5147/api/settings/materials';
    const method = editingItem ? 'PUT' : 'POST';
    const payload = editingItem ? { ...data, id: editingItem.id } : data;

    payload.density = Number(payload.density);
    payload.maxStorageAgeDays = Number(payload.maxStorageAgeDays);
    payload.dohThreshold = Number(payload.dohThreshold);

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      await fetch(`http://localhost:5147/api/settings/materials/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('tabs.mat.title', 'Raw Materials & Rules')}</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400" />
            <input
              type="text"
              placeholder={t('tabs.mat.search', 'Tìm nguyên liệu...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">
            <Plus className="h-4 w-4" />{t('tabs.mat.add', 'Add Material')}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-white/10 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">{t('tabs.mat.sku', 'SKU')}</th>
              <th className="px-4 py-3 font-medium">{t('tabs.mat.matName', 'Material Name')}</th>
              <th className="px-4 py-3 font-medium text-center">Color</th>
              <th className="px-4 py-3 font-medium">{t('tabs.mat.unit', 'Unit')}</th>
              <th className="px-4 py-3 font-medium text-right">Density (t/mÂ³)</th>
              <th className="px-4 py-3 font-medium text-right">{t('tabs.mat.stdAge', 'Ngày tuổi tiêu chuẩn')}</th>
              <th className="px-4 py-3 font-medium text-right">{t('tabs.mat.doh', 'DOH cảnh báo')}</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.sku.toLowerCase().includes(searchTerm.toLowerCase())).map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-mono text-sky-400">{mat.sku}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{mat.name}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 rounded-sm shadow-inner border border-white/20" style={{ backgroundColor: mat.color || '#10B981' }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{mat.color || '#10B981'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{mat.unit}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-400">{mat.density.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-amber-400">{mat.maxStorageAgeDays}</td>
                <td className="px-4 py-3 text-right font-mono text-rose-400">{mat.dohThreshold || 5}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(mat)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-sky-400"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(mat.id)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingItem ? 'Edit Material' : 'Add Material'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"><X className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tabs.mat.skuCode', 'SKU Code')}</label>
                <input {...register('sku', { required: true })} type="text" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tabs.mat.matName', 'Material Name')}</label>
                <input {...register('name', { required: true })} type="text" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Color (Hiển thị trên Silo)</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 w-10 h-10 shrink-0 p-1 bg-white dark:bg-slate-950">
                    <input {...register('color')} type="color" className="w-full h-full cursor-pointer bg-white dark:bg-slate-950" style={{ padding: 0, border: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('tabs.mat.unit', 'Unit')}</label>
                  <input {...register('unit', { required: true })} type="text" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Density (t/mÂ³)</label>
                  <input {...register('density', { required: true })} type="number" step="0.01" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Max Storage Age (Days)</label>
                  <input {...register('maxStorageAgeDays', { required: true })} type="number" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Min DOH (Days)</label>
                  <input {...register('dohThreshold', { required: true })} type="number" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




