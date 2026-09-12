import React, { useState, useEffect } from 'react';
import { PackageOpen, Loader2, UploadCloud, Search } from 'lucide-react';
import { UserMenu } from '../../components/layout/UserMenu';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { fumigationApi, FumigationLog } from '../../api/fumigationApi';

export default function StockSilo() {
  const { summary, loadDashboard, loading } = useDashboardStore();
  const user = useAuthStore(state => state.user);
  // Rules from settings
  const [materials, setMaterials] = useState<any[]>([]);
  const [fumigations, setFumigations] = useState<FumigationLog[]>([]);

  // Tooltip State
  const [hoveredSiloId, setHoveredSiloId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    let x = e.clientX;
    let y = e.clientY;
    
    // Bounds checking (assuming tooltip ~250px wide, ~200px tall)
    let left = x + 15;
    let top = y + 15;
    
    if (x + 280 > window.innerWidth) left = x - 260;
    if (y + 220 > window.innerHeight) top = y - 220;
    
    setMousePos({ x: left, y: top });
  };

  // Modal State
  const [editingSilo, setEditingSilo] = useState<any>(null);
  const [editColor, setEditColor] = useState('#FCD34D');
  const [editMaxAge, setEditMaxAge] = useState(180);
  const [editDoh, setEditDoh] = useState(5);
  const [savingRule, setSavingRule] = useState(false);

  useEffect(() => {
    if (!summary) loadDashboard();
    fetchMaterials();
    fetchFumigations();
  }, [summary, loadDashboard]);

  const fetchMaterials = () => {
    fetch('http://localhost:5147/api/settings/materials')
      .then(res => res.json())
      .then(setMaterials)
      .catch(console.error);
  };

  const fetchFumigations = async () => {
    try {
      const data = await fumigationApi.getAll();
      setFumigations(data);
    } catch (e) {
      console.error('Failed to fetch fumigations', e);
    }
  };

  const isSiloFumigating = (siloCode: string) => {
    const now = new Date().toISOString().split('T')[0];
    // Clean siloCode for matching (e.g., WH21 -> 21)
    const rawCode = siloCode.replace(/WH|WB|FM|D/g, '').trim();
    return fumigations.some(f => {
      const fRawCode = f.siloCode.replace(/WH|WB|FM|D/g, '').trim();
      return fRawCode === rawCode && now >= f.startDate && now <= f.endDate;
    });
  };

  const silos = summary?.silos || [];
  const alertCount = silos.filter(s => s.isCriticalAgeAlert || s.isLowStockAlert).length;

  const findSilo = (code: string) => {
    return silos.find(s => s.siloCode === code) || {
      siloCode: code,
      materialName: 'TRỐNG',
      currentStockTons: 0,
      capacityTons: 500,
      fillPercent: 0,
      isEmpty: true
    };
  };

  const WETBINS_1 = ['WB01', 'WB02', 'WB03', 'WB04', 'WB05', 'WB06'];
  const WETBINS_2 = ['WB07', 'WB08', 'WB09', 'WB10', 'WB11', 'WB12'];
  const WORKHOUSE_1 = ['WH25', 'WH26', 'WH27', 'WH28', 'WH29', 'WH30', 'WH31', 'WH32', 'WH33', 'WH34', 'WH35'];
  const WORKHOUSE_2 = ['WH36', 'WH37', 'WH38', 'WH39', 'WH40', 'WH41', 'WH42', 'WH43', 'WH44', 'WH45'];
  const GRAIN_1 = ['WH21', 'WH22', 'WH23', 'WH24'];
  const GRAIN_2 = ['D301', 'D302', 'D303', 'D304', 'D305', 'D306'];
  const MEAL_1 = ['201', '202'];
  const MEAL_2 = ['203', '204'];

  const getMaterialColor = (name: string) => {
    const n = name?.toUpperCase() || '';
    const mat = materials.find(m => m.name.toUpperCase() === n);
    if (mat && mat.color) return mat.color;

    if (n.includes('CORN ARG') || n.includes('CORN USA') || n.includes('CORN EXT')) return '#FCD34D';
    if (n.includes('SBM')) return '#FCA5A5';
    if (n.includes('WG')) return '#FDBA74';
    if (n.includes('SBS')) return '#86EFAC';
    if (n.includes('DDGS')) return '#7DD3FC';
    if (n.includes('CANOLA')) return '#93C5FD';
    if (n.includes('TBP') || n.includes('PKM') || n.includes('RBS') || n.includes('WB')) return '#38BDF8';
    return '#10B981';
  };

  const handleSiloClick = (siloCode: string) => {
    const silo = findSilo(siloCode);
    const n = silo.materialName?.toUpperCase() || '';
    const ruleMat = materials.find(m => m.name.toUpperCase() === n);

    setEditingSilo({
      ...silo,
      ruleId: ruleMat?.id
    });
    // @ts-ignore
    setEditColor(silo.isEmpty || silo.currentStockTons <= 0 ? '#E2E8F0' : (ruleMat?.color || getMaterialColor(silo.materialName)));
    setEditMaxAge(ruleMat?.maxStorageAgeDays || 180);
    setEditDoh(ruleMat?.dohThreshold || 5);
  };

  const handleSaveMaterial = async () => {
    if (!editingSilo || editingSilo.isEmpty || editingSilo.materialName === 'TRỐNG') {
      setEditingSilo(null);
      return;
    }
    
    setSavingRule(true);
    
    const payload = {
      name: editingSilo.materialName,
      sku: editingSilo.materialName,
      unit: 'Ton',
      density: 0.7,
      maxStorageAgeDays: editMaxAge,
      dohThreshold: editDoh,
      color: editColor
    };

    try {
      if (editingSilo.ruleId) {
        await fetch(`http://localhost:5147/api/settings/materials/${editingSilo.ruleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingSilo.ruleId })
        });
      } else {
        await fetch('http://localhost:5147/api/settings/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchMaterials();
      setEditingSilo(null);
    } catch (e) {
      console.error("Failed to save rule", e);
    } finally {
      setSavingRule(false);
    }
  };

  const renderSiloSVG = (siloCode: string, displayNameOverride: string | null = null) => {
    const silo = findSilo(siloCode);
    const isSelected = false;
    
    // @ts-ignore
    const isEmpty = silo.isEmpty || silo.currentStockTons <= 0;
    const liquidColor = isEmpty ? '#E2E8F0' : getMaterialColor(silo.materialName);
    
    const maxFillHeight = 110;
    const bottomY = 140;
    const fillP = silo.fillPercent ?? (silo.capacityTons > 0 ? (silo.currentStockTons / silo.capacityTons) * 100 : 0);
    const effectiveFill = isEmpty ? 3 : Math.max(0, Math.min(100, fillP));
    const fillHeight = Math.max(5, (effectiveFill / 100) * maxFillHeight);
    const fillY = bottomY - fillHeight;

    const displayName = displayNameOverride || siloCode.replace('WH', '').replace('WB', 'WB ');
    // @ts-ignore
    const hasAlert = (silo as any).isCriticalAgeAlert || silo.isLowStockAlert;
    const isFumigating = isSiloFumigating(siloCode);

    const siloPath = "M 15 25 L 85 25 L 85 115 L 60 140 L 40 140 L 15 115 Z";
    const fillPath = `M 15 ${Math.max(25, fillY)} L 85 ${Math.max(25, fillY)} L 85 115 L 60 140 L 40 140 L 15 115 Z`;
    const lidPath = "M 10 25 L 90 25";

    return (
      <div 
        key={siloCode} 
        onClick={() => handleSiloClick(siloCode)}
        onMouseEnter={() => setHoveredSiloId(siloCode)}
        onMouseLeave={() => setHoveredSiloId(null)}
        onMouseMove={handleMouseMove}
        className={`relative flex flex-col items-center justify-start transition-transform cursor-pointer p-0.5 flex-1 min-w-[35px] ${siloCode.match(/^(D301|D302|D303|D304|D305|D306)$/) ? 'max-w-[92px] xl:max-w-[115px]' : siloCode.match(/^(WH21|WH22|WH23|WH24)$/) ? 'max-w-[83px] xl:max-w-[104px]' : siloCode.match(/^(201|202|203|204)$/) ? 'max-w-[92px] xl:max-w-[115px]' : 'max-w-[74px] xl:max-w-[92px]'} hover:scale-105 hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg bg-black/5 dark:bg-white/10' : ''}`}
      >
        {isFumigating ? (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[5.5px] sm:text-[7px] font-black text-center z-20 px-1 py-0.5 rounded shadow-lg animate-bounce w-max max-w-[95%] leading-[1.2] border border-rose-400">
            ĐANG PHUN<br/>TRÙNG
          </div>
        ) : hasAlert ? (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] sm:text-[9px] font-bold text-center z-20 px-1.5 py-0.5 rounded shadow-lg animate-pulse whitespace-nowrap">
            CẢNH BÁO
          </div>
        ) : null}
        <div className="relative flex justify-center w-full group">
          <svg viewBox="0 0 100 150" className="w-full h-auto max-h-[15vh] xl:max-h-[18vh] 2xl:max-h-[20vh] drop-shadow-md overflow-visible" preserveAspectRatio="xMidYMax meet">
            <defs>
              <clipPath id={`clip-${siloCode}`}><path d={siloPath} /></clipPath>
              <linearGradient id={`grad-${siloCode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isFumigating ? '#FDA4AF' : liquidColor} stopOpacity="0.8" />
                <stop offset="50%" stopColor={isFumigating ? '#E11D48' : liquidColor} stopOpacity="1" />
                <stop offset="100%" stopColor={isFumigating ? '#9F1239' : liquidColor} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id={`glass-${siloCode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop offset="20%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </linearGradient>
              {hasAlert && !isFumigating && (
                <filter id={`glow-${siloCode}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              )}
            </defs>

            <path d={siloPath} fill="currentColor" className="text-[#F8FAFC] dark:text-slate-600" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" style={{ stroke: isFumigating ? '#FB7185' : '#CBD5E1' }} />
            <rect x="0" y={Math.max(25, fillY)} width="100" height="150" fill={`url(#grad-${siloCode})`} clipPath={`url(#clip-${siloCode})`} />
            <path d={siloPath} fill={`url(#glass-${siloCode})`} stroke={isFumigating ? '#E11D48' : hasAlert ? '#EF4444' : '#94A3B8'} strokeWidth={isFumigating || hasAlert ? '5' : '4'} strokeLinejoin="round" filter={hasAlert && !isFumigating ? `url(#glow-${siloCode})` : 'none'} />
            <path d={lidPath} stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
            
            <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="900" fill="currentColor" className="text-slate-900 dark:text-slate-100 silo-text">
              {displayName}
            </text>
            <text x="50" y="75" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" className="text-slate-900 dark:text-slate-200 silo-text">
              {isEmpty ? 'TRỐNG' : (silo.materialName.length > 12 ? silo.materialName.substring(0,10)+'...' : silo.materialName)}
            </text>
            <text x="50" y="95" textAnchor="middle" fontSize="15" fontWeight="900" fill="currentColor" className="text-slate-900 dark:text-slate-100 silo-text">
              {silo.currentStockTons.toFixed(0)}T
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-slate-200 rounded-xl overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between p-1.5 sm:p-2  bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 shadow-sm relative z-50 gap-2 min-h-[60px]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg md:text-xl font-black tracking-wider text-slate-800 dark:text-slate-100">SILO</h1>
          {alertCount > 0 && (
            <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap">
              {alertCount} Cảnh Báo
            </span>
          )}
          </div>
        <UserMenu />
      </div>

      <div className="flex-1 overflow-auto p-0.5 sm:p-1">
        {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}
        
        <div className="flex flex-col gap-0.5 w-full">
          
          <div className="flex flex-col xl:flex-row gap-0.5 w-full">
            
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm w-full xl:flex-[37] flex flex-col">
              <h2 className="text-[12px] sm:text-[14px] font-black text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-1 flex items-center gap-2 uppercase">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div> 1. WETBINS
              </h2>
              <div className="flex flex-col gap-0.5 w-full h-full justify-start">
                <div className="flex justify-center gap-0.5 w-full">
                  {WETBINS_1.map(code => renderSiloSVG(code))}
                </div>
                <div className="flex justify-center gap-0.5 w-full">
                  {WETBINS_2.map(code => renderSiloSVG(code))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm w-full xl:flex-[47] flex flex-col">
              <h2 className="text-[12px] sm:text-[14px] font-black text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-1 flex items-center gap-2 uppercase">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div> 2. GRAIN SILO
              </h2>
              <div className="flex flex-col gap-0.5 items-center w-full h-full justify-start">
                <div className="flex justify-center gap-0.5 sm:gap-0.5 w-full">
                  {GRAIN_1.map(code => renderSiloSVG(code, code.replace('WH', '')))}
                </div>
                <div className="flex justify-center gap-0.5 w-full">
                  {GRAIN_2.map(code => renderSiloSVG(code, code.replace('D', 'D ')))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm w-full xl:flex-[16] flex flex-col">
              <h2 className="text-[12px] sm:text-[14px] font-black text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-1 flex items-center gap-2 uppercase">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div> 3. MEAL SILO
              </h2>
              <div className="flex flex-col gap-0.5 items-center w-full h-full justify-start">
                <div className="flex justify-center gap-0.5 w-full">
                  {MEAL_1.map(code => renderSiloSVG(code))}
                </div>
                <div className="flex justify-center gap-0.5 w-full">
                  {MEAL_2.map(code => renderSiloSVG(code))}
                </div>
              </div>
            </div>

          </div>

          <div className="flex w-full">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl p-0.5 shadow-sm w-full flex flex-col">
              <h2 className="text-[12px] sm:text-[14px] font-black text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-1 flex items-center gap-2 uppercase">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> WORKHOUSE (25 - 45)
              </h2>
              <div className="flex flex-col gap-0.5 items-center w-full justify-start">
                <div className="flex justify-evenly gap-1 w-full">
                  {WORKHOUSE_1.map(code => renderSiloSVG(code))}
                </div>
                <div className="flex justify-evenly gap-1 w-full">
                  {WORKHOUSE_2.map(code => renderSiloSVG(code))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      
      {hoveredSiloId && (
        <div 
          className="fixed z-[9999] bg-slate-900/95 backdrop-blur-sm border border-white/10 text-slate-100 p-4 rounded-xl shadow-2xl pointer-events-none min-w-[240px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          {(() => {
            const silo = findSilo(hoveredSiloId);
            if (!silo) return null;
            // @ts-ignore
            const isEmpty = silo.isEmpty || silo.currentStockTons <= 0;
            return (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
                  <span className="font-black text-lg text-blue-400">{silo.siloCode}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${isEmpty ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isEmpty ? 'TRỐNG' : 'ĐANG CHỨA'}
                  </span>
                </div>
                {!isEmpty ? (
                  <>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Vật tư:</span>
                      <span className="font-semibold text-right">{silo.materialName}</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Tồn kho:</span>
                      <span className="font-mono text-emerald-400 font-bold">{silo.currentStockTons.toFixed(1)} T</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Sức chứa:</span>
                      <span className="font-mono">{silo.capacityTons.toFixed(1)} T</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Mức đầy:</span>
                      <span className="font-mono">{(silo.fillPercent ?? ((silo.capacityTons > 0 ? (silo.currentStockTons / silo.capacityTons) * 100 : 0))).toFixed(1)}%</span>
                    </div>
                    {(silo as any).batchNumber && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-slate-400">Lô:</span>
                        <span className="font-mono">{(silo as any).batchNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Lưu kho:</span>
                      <span className={`font-mono font-bold ${(silo as any).isCriticalAgeAlert ? 'text-rose-400' : 'text-slate-200'}`}>{(silo as any).ageInDays} ngày</span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-2">
                    Silo hiện đang trống
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {editingSilo && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col transform transition-all border dark:border-white/10">
            <div className="bg-[#1E293B] dark:bg-slate-950 p-4 flex justify-between items-center text-white border-b dark:border-white/10">
          <h3 className="font-bold text-lg">Chỉnh sửa Nguyên liệu & Rules</h3>
              <button onClick={() => setEditingSilo(null)} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">&times;</button>
            </div>
            
            <div className="p-5 flex flex-col gap-4 bg-white dark:bg-slate-900">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Silo hiện tại</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={editingSilo.siloCode.replace('WH', '').replace('WB', 'WB ')} 
                    className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-medium outline-none" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Color</label>
                  <div className="flex items-center gap-2 h-[42px]">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 w-full h-full shrink-0 bg-white dark:bg-slate-950 p-0.5">
                      <input 
                        type="color" 
                        value={editColor} 
                        onChange={e => setEditColor(e.target.value)} 
                        className="w-full h-full cursor-pointer bg-transparent" 
                        style={{ padding: 0, border: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nguyên liệu</label>
                <input 
                  type="text" 
                  readOnly 
                  value={editingSilo.isEmpty ? 'TRỐNG' : editingSilo.materialName} 
                  className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-bold outline-none" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Max Age (Ngày)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={editMaxAge} 
                    onChange={e => setEditMaxAge(parseInt(e.target.value) || 0)} 
                    className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                  />
                </div>
                <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Cảnh báo DOH (Ngày)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={editDoh} 
                    onChange={e => setEditDoh(parseInt(e.target.value) || 0)} 
                    className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 flex items-center justify-end gap-3 bg-white dark:bg-slate-900 pt-2 rounded-b-xl border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setEditingSilo(null)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium px-4 py-2 transition-colors"
                disabled={savingRule}
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveMaterial} 
                disabled={savingRule || editingSilo.isEmpty}
                className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
              >
                {savingRule && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



