const fs = require('fs');

let c = fs.readFileSync('frontend/src/store/dashboardStore.ts', 'utf8');

// We already fetch `silos` for `configRes`. Let's just use it to set `locationConfigs`.
c = c.replace(/fetch\('http:\/\/localhost:5147\/api\/settings\/locations'\)\.catch\(\(\) => null\)/, "null");

const regexSet = /let locationConfigs = \[\];\s*if \(locRes && locRes\.ok\) \{\s*locationConfigs = await locRes\.json\(\);\s*\}/;
c = c.replace(regexSet, `let locationConfigs = [];
      if (configRes && configRes.ok) {
        // configRes was already consumed! We need to clone it or fetch again.
        // Wait, configs is already parsed above: const configs = await configRes.json();
      }`);

// Actually, let's just write a better replacement for the whole try block.
const tryBlockRegex = /try \{[\s\S]*?set\(\{ summary, locationConfigs, loading: false \}\);/;
const newTryBlock = `try {
      const targetDate = date || get().selectedDate || undefined;
      const [summary, configRes] = await Promise.all([
        fetchDashboardSummary(targetDate),
        fetch('http://localhost:5147/api/settings/silos').catch(() => null)
      ]);
      
      let locationConfigs = [];
      if (configRes && configRes.ok) {
        const configs = await configRes.json();
        locationConfigs = configs;
        summary.silos = summary.silos.filter((s: any) => {
           return !configs.find((c: any) => c.siloCode === s.siloCode && c.materialName === s.materialName && c.isHidden);
        });
        summary.additives = summary.additives.filter((a: any) => {
           const siloCode = a.warehouseLocation || 'WH';
           return !configs.find((c: any) => c.siloCode === siloCode && c.materialName === a.materialName && c.isHidden);
        });
      }
      
      set({ summary, locationConfigs, loading: false });`;

c = c.replace(tryBlockRegex, newTryBlock);
fs.writeFileSync('frontend/src/store/dashboardStore.ts', c);
console.log('Updated dashboardStore.ts');
