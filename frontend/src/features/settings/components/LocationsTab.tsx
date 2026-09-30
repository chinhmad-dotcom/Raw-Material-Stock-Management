import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Loader2, Edit2, X, Trash2 } from 'lucide-react';

interface LocationConfig {
  id: string; // e.g. B12.1
  maxCapacity: number;
  unit: 'tons' | 'pallets';
}

// These are all possible locations in Kho Nguyen Lieu
const ALL_LOCATIONS = [
  "B12.1", "B12.2", "B13.1", "B13.2", "B14.1", "B14.2", "B14.3", "B14.4", "B15.1", "B15.2", "B16.1", "B16.2", "B17.1", "B17.2", "B18.1", "B18.2", "B19.1",
  "A10.1", "A10.2", "A11.1", "A11.2", "A12.1", "A12.2", "A13.1", "A13.2",
  "A15.1", "A15.2", "A16.1A", "A16.1B", "A16.2A", "A16.2B",
  "V9.3", "V9.2", "V9.1", "V8.3", "V8.2", "V8.1", "V7.3", "V7.2", "V7.1", "V6.3", "V6.2", "V6.1", "V5.3", "V5.2", "V5.1", "V4.3", "V4.2", "V4.1", "V3.3", "V3.2", "V3.1", "V2.3", "V2.2", "V2.1", "V1.3", "V1.2", "V1.1",
  "Z7.1", "Z7.2", "Z7.3", "Z6.1", "Z6.2", "Z6.3", "Z5.1", "Z5.2", "Z5.3", "Z4.1", "Z4.2", "Z4.3", "Z3.1", "Z3.2", "Z3.3", "Z2.1", "Z2.2", "Z2.3", "Z1.1", "Z1.2", "Z1.3",
  "Y7.3", "Y7.2", "Y7.1", "Y6.3", "Y6.2", "Y6.1", "Y5.3", "Y5.2", "Y5.1", "Y4.3", "Y4.2", "Y4.1", "Y3.3", "Y3.2", "Y3.1", "Y2.3", "Y2.2", "Y2.1", "Y1.3", "Y1.2", "Y1.1",
  "X8.1", "X8.2", "X8.3", "X7.1", "X7.2", "X7.3", "X6.1", "X6.2", "X6.3", "X5.1", "X5.2", "X5.3", "X4.1", "X4.2", "X4.3", "X3.1", "X3.2", "X3.3", "X2.1", "X2.2", "X2.3", "X1.1", "X1.2", "X1.3",
  "A18.6", "A19.6", "A22.6", "A18.5", "A19.5", "A22.5", "A18.4", "A19.4", "A22.4", "A18.3", "A19.3", "A22.3", "A18.2", "A19.2", "A22.2", "A18.1", "A19.1", "A22.1",
  "B21.1", "B21.2", "B22.1", "B22.2", "B23.1", "B23.2", "B24.1", "B24.2", "B25.1", "B25.2", "C12", "C11", "C10", "C9", "C8", "C7", "C6", "C5", "C4", "C3", "C2", "C1", "H",
  "D3", "D2", "D1", "E3", "E2", "E1",
  "A8", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "B8", "B7", "B6", "B5", "B4", "B3", "B2", "B1"
];

export function LocationsTab() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<LocationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editCap, setEditCap] = useState(0);
  const [editUnit, setEditUnit] = useState<'tons'|'pallets'>('tons');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5147/api/settings/locations');
      if (res.ok) {
        setConfigs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (loc: string) => {
    const existing = configs.find(c => c.id === loc);
    setEditingLoc(loc);
    setEditCap(existing?.maxCapacity || 0);
    setEditUnit(existing?.unit || 'tons');
  };

  const handleSave = async () => {
    if (!editingLoc) return;
    try {
      await fetch('http://localhost:5147/api/settings/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLoc, maxCapacity: editCap, unit: editUnit })
      });
      setEditingLoc(null);
      fetchData();
    } catch(e) {}
  };

  const handleDelete = async (loc: string) => {
    if (!confirm('Xóa cấu hình này?')) return;
    try {
      await fetch(`http://localhost:5147/api/settings/locations/${loc}`, { method: 'DELETE' });
      fetchData();
    } catch(e) {}
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cấu hình Vị trí Kho Nguyên Liệu</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thiết lập sức chứa cho các vị trí (không áp dụng cho Silo / Liquid)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Location</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Sức chứa tối đa</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Đơn vị</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {ALL_LOCATIONS.map(loc => {
                const conf = configs.find(c => c.id === loc);
                return (
                  <tr key={loc} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{loc}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{conf?.maxCapacity || 'Chưa cài đặt'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{conf?.unit === 'pallets' ? 'Số Pallet' : conf?.unit === 'tons' ? 'Khối lượng (Tấn)' : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(loc)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {conf && (
                          <button onClick={() => handleDelete(loc)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cài đặt Location {editingLoc}</h3>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sức chứa tối đa</label>
                <input 
                  type="number" 
                  value={editCap} 
                  onChange={e => setEditCap(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Đơn vị</label>
                <select 
                  value={editUnit} 
                  onChange={e => setEditUnit(e.target.value as 'tons'|'pallets')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500"
                >
                  <option value="tons">Khối lượng (Tấn)</option>
                  <option value="pallets">Số Pallet</option>
                </select>
              </div>
              <div className="pt-2">
                <button onClick={handleSave} className="w-full flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Lưu Cài Đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
