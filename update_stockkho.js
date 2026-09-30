const fs = require('fs');

const path = 'frontend/src/pages/stock/StockKho.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import AlertTriangle
content = content.replace(/PackageOpen, UploadCloud, Loader2 } from 'lucide-react';/, "PackageOpen, UploadCloud, Loader2, AlertTriangle, Settings2, X, Save } from 'lucide-react';");

// Add locationConfigs to useDashboardStore destructuring
content = content.replace(/const \{ summary, selectedDate, loadDashboard \} = useDashboardStore\(\);/, 'const { summary, selectedDate, locationConfigs, loadDashboard } = useDashboardStore();');

// Add state for modal
content = content.replace(/const \[uploading, setUploading\] = useState\(false\);/, `const [uploading, setUploading] = useState(false);
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<'tons'|'pallets'>('tons');
`);

// Add save function for location config
const saveLocFunction = `
  const handleSaveLocConfig = async () => {
    if (!editingLoc) return;
    try {
      const payload = { id: editingLoc, maxCapacity: editCapacity, unit: editUnit };
      await fetch('http://localhost:5147/api/settings/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingLoc(null);
      loadDashboard();
    } catch(e) {
      alert('Error saving config');
    }
  };
`;

content = content.replace(/const getAdditivesAt = \(loc: string\) => additives\.filter\(a => a\.warehouseLocation === loc && a\.currentStockTons > 0\);/, `const getAdditivesAt = (loc: string) => additives.filter(a => a.warehouseLocation === loc && a.currentStockTons > 0);\n${saveLocFunction}`);

// Add click handler and alerts logic to location rendering
const locRenderRegex = /return \(\s*<div key=\{loc\} className="flex min-h-\[60px\] flex-col rounded-xl border border-slate-200 dark:border-white\/10 bg-white dark:bg-slate-950 p-1\.5 shadow-inner hover:border-sky-500\/50 transition-colors">\s*<div className="mb-1 text-xs font-black text-slate-500 dark:text-slate-500">\{loc\}<\/div>/;

const newLocRender = `
                const locConfig = (locationConfigs || []).find(c => c.id === loc);
                const hasCriticalAge = items.some(i => i.isCriticalAgeAlert || i.isNearExpiryAlert);
                const hasLowStock = items.some(i => i.isLowStockAlert);
                const totalTons = items.reduce((sum, item) => sum + item.currentStockTons, 0);
                let isAlmostFull = false;
                if (locConfig && locConfig.maxCapacity > 0) {
                    if (totalTons >= locConfig.maxCapacity * 0.9) isAlmostFull = true;
                }

                return (
                  <div key={loc} 
                       onClick={() => {
                          if (userRole === 'Admin' || userRole === 'Manager') {
                            setEditingLoc(loc);
                            setEditCapacity(locConfig?.maxCapacity || 0);
                            setEditUnit(locConfig?.unit || 'tons');
                          }
                       }}
                       className={\`relative flex min-h-[60px] flex-col rounded-xl border \${isAlmostFull ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-slate-950 p-1.5 shadow-inner hover:border-sky-500/50 transition-colors cursor-pointer\`}>
                    
                    {/* Alerts Row */}
                    <div className="absolute top-1 right-1 flex gap-1 z-10">
                       {hasCriticalAge && <span className="bg-red-500 text-white text-[8px] font-bold px-1 rounded animate-pulse" title="Quá hạn / Gần hết hạn">HẠN</span>}
                       {hasLowStock && <span className="bg-orange-500 text-white text-[8px] font-bold px-1 rounded animate-pulse" title="Stock thấp (< 5 ngày)">LOW</span>}
                       {isAlmostFull && <span className="bg-amber-500 text-white text-[8px] font-bold px-1 rounded animate-pulse" title="Gần đầy / Đầy">ĐẦY</span>}
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-black text-slate-500 dark:text-slate-500">{loc}</span>
                      {locConfig && locConfig.maxCapacity > 0 && (
                        <span className="text-[9px] text-slate-400">({totalTons.toFixed(1)}/{locConfig.maxCapacity} {locConfig.unit})</span>
                      )}
                    </div>
`;

content = content.replace(locRenderRegex, newLocRender);

// Add modal at the end of the return statement
const modalJSX = `
      {editingLoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-sky-500" /> Cài đặt Location {editingLoc}
              </h3>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sức chứa tối đa (Max Capacity)</label>
                <input 
                  type="number" 
                  value={editCapacity} 
                  onChange={e => setEditCapacity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Đơn vị</label>
                <select 
                  value={editUnit} 
                  onChange={e => setEditUnit(e.target.value as 'tons'|'pallets')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="tons">Khối lượng (Tấn)</option>
                  <option value="pallets">Số Pallet</option>
                </select>
              </div>
              <div className="pt-2">
                <button onClick={handleSaveLocConfig} className="w-full flex justify-center items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  <Save className="w-4 h-4" /> Lưu Cài Đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\};\s*export default StockKho;/, modalJSX + '\nexport default StockKho;');

fs.writeFileSync(path, content);
console.log('StockKho.tsx updated for Task 2.');
