const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/settings/components/SiloTab.tsx', 'utf8');

c = c.replace(/\{showCapacity && \(\s*<td className="px-2 py-2 text-right font-mono">\s*\{item\.maxCapacity !== null \? item\.maxCapacity\.toLocaleString\(\) : <span className="text-slate-500 dark:text-slate-500">-<\/span>\}\s*<\/td>\s*\)\}/g, 
  `<td className="px-2 py-2 text-right font-mono">
    {item.maxCapacity !== null ? (item.maxCapacity + (item.unit === 'pallets' ? ' PL' : ' T')) : <span className="text-slate-500 dark:text-slate-500">-</span>}
  </td>`);

c = c.replace(/\{showCapacity && <th className="px-2 py-2 font-medium text-right">Max \(T\)<\/th>\}/g, 
  '<th className="px-2 py-2 font-medium text-right">Max</th>');

fs.writeFileSync('frontend/src/features/settings/components/SiloTab.tsx', c);
console.log('Fixed SiloTab table output');
