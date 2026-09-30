const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/settings/components/SiloTab.tsx', 'utf8');

c = c.replace(/interface SiloConfig \{([\s\S]*?)color\?: string;/g, "interface SiloConfig {$1color?: string;\n  unit?: 'tons' | 'pallets';");
c = c.replace(/maxCapacity: number \| null;/g, "maxCapacity: number | null;\n  unit?: 'tons' | 'pallets';");

c = c.replace(/maxCapacity: conf \? conf\.maxCapacity : null,/g, "maxCapacity: conf ? conf.maxCapacity : null,\n          unit: conf?.unit || 'tons',");
c = c.replace(/setValue\('maxCapacity', item\.maxCapacity \|\| 0\);/g, "setValue('maxCapacity', item.maxCapacity || 0);\n    setValue('unit', item.unit || 'tons');");

c = c.replace(/const showCapacity = groupType !== 'Phụ gia';/g, "const showCapacity = true;");
c = c.replace(/const showCapacity = groupType !== 'Ph gia';/g, "const showCapacity = true;");

c = c.replace(/\{showCapacity && <th className="px-2 py-2 font-medium text-right">Max \(T\)<\/th>\}/g, '<th className="px-2 py-2 font-medium text-right">Max</th>');
c = c.replace(/\{showCapacity && <td className="px-2 py-2 text-right font-mono font-medium">\{item\.maxCapacity\}\s*<\/td>\}/g, '<td className="px-2 py-2 text-right font-mono font-medium">{item.maxCapacity} {item.unit === "pallets" ? "PL" : "T"}</td>');

// Remove groupType check for maxCapacity input
c = c.replace(/\{editingItem\.groupType !== 'Phụ gia' && \(\s*<div>/g, "<div>");
c = c.replace(/\{editingItem\.groupType !== 'Ph gia' && \(\s*<div>/g, "<div>");
c = c.replace(/<\/div>\s*\)\}\s*<div>\s*<label className="text-xs/g, '</div>\n\n                <div>\n                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Đơn vị</label>\n                  <select {...register(\'unit\')} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">\n                    <option value="tons">Khối lượng (Tấn)</option>\n                    <option value="pallets">Số Pallet</option>\n                  </select>\n                </div>\n\n                <div>\n                  <label className="text-xs');

fs.writeFileSync('frontend/src/features/settings/components/SiloTab.tsx', c);
console.log('Updated SiloTab.tsx');
