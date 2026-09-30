const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/stock/StockKho.tsx', 'utf8');

// 1. Change HẠN to QUÁ NGÀY
c = c.replace(/title="Quá hạn \/ Gần hết hạn">HẠN<\/span>/g, 'title="Quá ngày tuổi">QUÁ NGÀY</span>');

// 2. Fix the onClick role check
// Original: if (userRole === 'Admin' || userRole === 'Manager') {
// We will remove the role check or include 'Operator' or just remove it to be safe.
c = c.replace(/if \(userRole === 'Admin' \|\| userRole === 'Manager'\) \{([\s\S]*?)\}/, '$1');

// 3. Update the endpoint in handleSaveLocConfig
// It was: fetch('http://localhost:5147/api/settings/locations'
c = c.replace(/fetch\('http:\/\/localhost:5147\/api\/settings\/locations'/g, "fetch('http://localhost:5147/api/settings/silos'");

// The payload for /api/settings/silos requires siloCode.
// Original: const payload = { id: editingLoc, maxCapacity: editCapacity, unit: editUnit };
c = c.replace(/const payload = \{ id: editingLoc, maxCapacity: editCapacity, unit: editUnit \};/, "const payload = { siloCode: editingLoc, maxCapacity: editCapacity, unit: editUnit };");

// 4. In rendering, locationConfigs will now have objects with `siloCode` instead of `id`.
// Original: const locConfig = (locationConfigs || []).find(c => c.id === loc);
c = c.replace(/const locConfig = \(locationConfigs \|\| \[\]\)\.find\(c => c\.id === loc\);/, "const locConfig = (locationConfigs || []).find(c => c.siloCode === loc);");

fs.writeFileSync('frontend/src/pages/stock/StockKho.tsx', c);
console.log('Updated StockKho.tsx');
