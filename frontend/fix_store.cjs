const fs = require('fs');
let code = fs.readFileSync('src/store/dashboardStore.ts', 'utf8');

const oldLoad = `const summary = await fetchDashboardSummary(targetDate);
      set({ summary, loading: false });`;
const newLoad = `const [summary, configRes] = await Promise.all([
        fetchDashboardSummary(targetDate),
        fetch('http://localhost:5147/api/settings/silos').catch(() => null)
      ]);
      
      if (configRes && configRes.ok) {
        const configs = await configRes.json();
        summary.silos = summary.silos.filter((s: any) => {
           return !configs.find((c: any) => c.siloCode === s.siloCode && c.materialName === s.materialName && c.isHidden);
        });
        summary.additives = summary.additives.filter((a: any) => {
           const siloCode = a.warehouseLocation || 'WH';
           return !configs.find((c: any) => c.siloCode === siloCode && c.materialName === a.materialName && c.isHidden);
        });
      }
      
      set({ summary, loading: false });`;

code = code.replace(oldLoad, newLoad);
fs.writeFileSync('src/store/dashboardStore.ts', code, 'utf8');
console.log('Updated store to filter hidden silos');
