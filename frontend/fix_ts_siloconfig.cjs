const fs = require('fs');
let code = fs.readFileSync('src/features/settings/components/SiloTab.tsx', 'utf8');

const oldInterface = `interface SiloConfig {
  id?: string;
  siloCode: string;
  maxCapacity: number;
  color?: string;
}`;
const newInterface = `interface SiloConfig {
  id?: string;
  siloCode: string;
  materialName?: string;
  maxCapacity: number;
  color?: string;
  isHidden?: boolean;
}`;
code = code.replace(oldInterface, newInterface);

// Wait, I also need to make sure I add @ts-ignore for the store/dashboardStore.ts if needed, but it used `(c: any)` and `(s: any)` so it should be fine there.
fs.writeFileSync('src/features/settings/components/SiloTab.tsx', code, 'utf8');
console.log('Fixed SiloConfig TS error');
