const fs = require('fs');
let content = fs.readFileSync('frontend/src/store/dashboardStore.ts', 'utf8');

const regexState = /interface DashboardState \{[\s\S]*?loadDashboard: /;
content = content.replace(regexState, (match) => {
    return match.replace('loadDashboard: ', 'locationConfigs: any[];\n  loadDashboard: ');
});

const regexInitial = /selectedDate: null,/;
content = content.replace(regexInitial, 'selectedDate: null,\n  locationConfigs: [],');

const regexFetch = /const \[summary, configRes\] = await Promise\.all\(\[\s*fetchDashboardSummary\(targetDate\),\s*fetch\('http:\/\/localhost:5147\/api\/settings\/silos'\)\.catch\(\(\) => null\)\s*\]\);/;
const replacementFetch = `const [summary, configRes, locRes] = await Promise.all([
        fetchDashboardSummary(targetDate),
        fetch('http://localhost:5147/api/settings/silos').catch(() => null),
        fetch('http://localhost:5147/api/settings/locations').catch(() => null)
      ]);`;
content = content.replace(regexFetch, replacementFetch);

const regexSet = /set\(\{ summary, loading: false \}\);/;
const replacementSet = `
      let locationConfigs = [];
      if (locRes && locRes.ok) {
        locationConfigs = await locRes.json();
      }
      set({ summary, locationConfigs, loading: false });`;
content = content.replace(regexSet, replacementSet);

fs.writeFileSync('frontend/src/store/dashboardStore.ts', content);
console.log('Updated dashboardStore.ts');
