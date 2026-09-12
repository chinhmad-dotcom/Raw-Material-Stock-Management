const fs = require('fs');
let code = fs.readFileSync('src/pages/stock/StockSilo.tsx', 'utf8');

// 1. Add state to StockSilo component
const stateRegex = /const \[materials, setMaterials\] = useState<any\[\]>\(\[\]\);/g;
if (code.match(stateRegex)) {
  const newState = `const [materials, setMaterials] = useState<any[]>([]);

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
  };`;
  code = code.replace(stateRegex, newState);
}

// 2. Add event listeners to silo wrapper
const wrapperRegex = /onClick=\{\(\) => handleSiloClick\(siloCode\)\}/g;
const newEvents = `onClick={() => handleSiloClick(siloCode)}
        onMouseEnter={() => setHoveredSiloId(siloCode)}
        onMouseLeave={() => setHoveredSiloId(null)}
        onMouseMove={handleMouseMove}`;
code = code.replace(wrapperRegex, newEvents);

// 3. Add Tooltip UI at the end of the file (before the last closing tag)
// I will find the end of the main `return (...)` block.
// The easiest way is to look for the last `</div>\n    </div>\n  );\n}` or similar.
// Looking at my knowledge of the file, it ends with:
// `      {editingSilo && ( ... Modal ... )} \n    </div>\n  );\n}`
// Let's insert the tooltip right before the editingSilo modal.

const tooltipCode = `
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
                  <span className={\`px-2 py-0.5 rounded text-xs font-bold \${isEmpty ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}\`}>
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
                    {silo.batchNumber && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-slate-400">Lô:</span>
                        <span className="font-mono">{silo.batchNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-slate-400">Lưu kho:</span>
                      <span className={\`font-mono font-bold \${silo.isCriticalAgeAlert ? 'text-rose-400' : 'text-slate-200'}\`}>{silo.ageInDays} ngày</span>
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
`;

code = code.replace('{editingSilo && (', tooltipCode + '\n      {editingSilo && (');

fs.writeFileSync('src/pages/stock/StockSilo.tsx', code, 'utf8');
console.log('Added tooltip logic');
