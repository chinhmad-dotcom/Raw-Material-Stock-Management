const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { PackageOpen, UploadCloud, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { uploadAdditiveStockExcel } from '../../api/import';
import { useDashboardStore } from '../../store/dashboardStore';

// Define the zones and their locations based on the PDF
const ZONES = [
  {
    name: "KHU VỰC KHOÁNG CHẤT + SỮA + HP300",
    locations: ["B12.1", "B12.2", "B13.1", "B13.2", "B14.1", "B14.2", "B14.3", "B14.4", "B15.1", "B15.2", "B16.1", "B16.2", "B17.1", "B17.2", "B18.1", "B18.2", "B19.1"]
  },
  {
    name: "KHU VỰC KHOÁNG CHẤT",
    locations: ["A10.1", "A10.2", "A11.1", "A11.2", "A12.1", "A12.2", "A13.1", "A13.2"]
  },
  {
    name: "KHU VỰC ACID",
    locations: ["A15.1", "A15.2", "A16.1A", "A16.1B", "A16.2A", "A16.2B"]
  },
  {
    name: "KHO PHỤ GIA VÀ PREMIX",
    // We can group V, Z, Y, X into sub-rows for better layout or just a big grid
    locations: [
      "V9.3", "V9.2", "V9.1", "V8.3", "V8.2", "V8.1", "V7.3", "V7.2", "V7.1", "V6.3", "V6.2", "V6.1", "V5.3", "V5.2", "V5.1", "V4.3", "V4.2", "V4.1", "V3.3", "V3.2", "V3.1", "V2.3", "V2.2", "V2.1", "V1.3", "V1.2", "V1.1",
      "Z7.1", "Z7.2", "Z7.3", "Z6.1", "Z6.2", "Z6.3", "Z5.1", "Z5.2", "Z5.3", "Z4.1", "Z4.2", "Z4.3", "Z3.1", "Z3.2", "Z3.3", "Z2.1", "Z2.2", "Z2.3", "Z1.1", "Z1.2", "Z1.3",
      "Y7.3", "Y7.2", "Y7.1", "Y6.3", "Y6.2", "Y6.1", "Y5.3", "Y5.2", "Y5.1", "Y4.3", "Y4.2", "Y4.1", "Y3.3", "Y3.2", "Y3.1", "Y2.3", "Y2.2", "Y2.1", "Y1.3", "Y1.2", "Y1.1",
      "X8.1", "X8.2", "X8.3", "X7.1", "X7.2", "X7.3", "X6.1", "X6.2", "X6.3", "X5.1", "X5.2", "X5.3", "X4.1", "X4.2", "X4.3", "X3.1", "X3.2", "X3.3", "X2.1", "X2.2", "X2.3", "X1.1", "X1.2", "X1.3"
    ]
  },
  {
    name: "KHU VỰC ĐẠM ĐỘNG VẬT",
    locations: ["B21.1", "B21.2", "B22.1", "B22.2", "B23.1", "B23.2", "B24.1", "B24.2", "B25.1", "B25.2", "C12", "C11", "C10", "C9", "C8", "C7", "C6", "C5", "C4", "C3", "C1", "C0", "H"]
  },
  {
    name: "KHO LẠNH",
    locations: ["D3", "D2", "D1", "E3", "E2", "E1"]
  },
  {
    name: "KHU VỰC SỮA + CAROMIC + HP300",
    locations: ["A8", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "B8", "B7", "B6", "B5", "B4", "B3", "B2", "B1"]
  }
];

const StockKho: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useAuthStore(state => state.user);
  const userRole = user?.role;
  
  const { summary, loadDashboard } = useDashboardStore();
  const additives = summary?.additives || [];

  useEffect(() => {
    if (!summary) loadDashboard();
  }, [summary, loadDashboard]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadAdditiveStockExcel(file);
      alert('Tải báo cáo Kho thành công!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Lỗi tải báo cáo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to find additives by location prefix
  const getAdditivesAt = (loc: string) => additives.filter(a => a.warehouseLocation === loc);

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto px-4 py-4 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20">
            <PackageOpen className="h-8 w-8 text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Sơ Đồ Kho (Stock Kho)</h2>
            <p className="text-sm text-slate-400">
              Mô phỏng mặt bằng các khu vực lưu trữ nguyên liệu trong Kho theo chuẩn sơ đồ.
            </p>
          </div>
        </div>

        {userRole?.toLowerCase() !== 'viewer' && (
          <div className="flex items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-medium text-slate-950 shadow-md transition-colors hover:bg-sky-400 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />} 
              Nhập báo cáo Kho
            </button>
          </div>
        )}
      </div>

      {/* Map Layout */}
      <div className="flex flex-col gap-6">
        {ZONES.map((zone, idx) => (
          <section key={idx} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="h-4 w-4 rounded bg-sky-500/40 border border-sky-500/50"></div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-sky-400">{zone.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {zone.locations.map(loc => {
                const items = getAdditivesAt(loc);
                return (
                  <div key={loc} className="flex min-h-[90px] flex-col rounded-xl border border-white/10 bg-slate-950 p-3 shadow-inner hover:border-sky-500/50 transition-colors">
                    <div className="mb-1 text-xs font-black text-slate-500">{loc}</div>
                    {items.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {items.map(item => (
                          <div key={item.materialId} className="flex flex-col">
                            <span className="truncate text-xs font-semibold text-slate-200" title={item.materialName}>{item.materialName}</span>
                            <span className="text-sm font-mono font-bold text-sky-400">{item.currentStockTons.toFixed(0)} T</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center">
                        <span className="text-[10px] text-slate-700">Trống</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Unmapped or Other Locations */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="h-4 w-4 rounded bg-slate-500/40 border border-slate-500/50"></div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400">CÁC VỊ TRÍ KHÁC</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {additives
                .filter(a => !ZONES.some(z => z.locations.includes(a.warehouseLocation || '')))
                .map(item => (
                  <div key={item.materialId} className="flex min-h-[90px] flex-col rounded-xl border border-white/10 bg-slate-950 p-3 shadow-inner">
                    <div className="mb-1 text-xs font-black text-slate-500">{item.warehouseLocation || 'N/A'}</div>
                    <div className="flex flex-col">
                      <span className="truncate text-xs font-semibold text-slate-200" title={item.materialName}>{item.materialName}</span>
                      <span className="text-sm font-mono font-bold text-sky-400">{item.currentStockTons.toFixed(0)} T</span>
                    </div>
                  </div>
              ))}
            </div>
          </section>
      </div>

    </div>
  );
};

export default StockKho;
`
fs.writeFileSync('src/pages/stock/StockKho.tsx', code);
console.log('StockKho updated with real layout');
