const fs = require('fs');

let sk = fs.readFileSync('src/pages/stock/StockKho.tsx', 'utf8');

// Header changes
sk = sk.replace('Sơ Đồ Kho (Stock Kho)', 'Sơ Đồ Kho');
sk = sk.replace(/<p className="text-sm text-slate-600 dark:text-slate-400">\s*Mô phỏng mặt bằng các khu vực lưu trữ nguyên liệu trong Kho theo chuẩn sơ đồ\.\s*<\/p>/g, '');

// Spacing main wrapper
sk = sk.replace('gap-6 overflow-y-auto px-4 py-4', 'gap-2 overflow-y-auto px-2 py-2');

// Header spacing
sk = sk.replace('p-6 shadow-sm', 'p-3 shadow-sm');
sk = sk.replace('gap-6', 'gap-3');
sk = sk.replace('h-16 w-16', 'h-10 w-10');
sk = sk.replace('h-8 w-8', 'h-5 w-5');
sk = sk.replace('text-2xl font-bold', 'text-lg font-bold');

// Map layout spacing
sk = sk.replace('gap-6">', 'gap-2">');
sk = sk.replace('p-5">', 'p-2 sm:p-3">');
sk = sk.replace('mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3', 'mb-2 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2');
sk = sk.replace('h-4 w-4 rounded', 'h-3 w-3 rounded');
sk = sk.replace('text-lg font-bold uppercase tracking-wider', 'text-sm font-bold uppercase tracking-wider');
sk = sk.replace('gap-3 sm:grid-cols-4', 'gap-1.5 sm:grid-cols-4');
sk = sk.replace('min-h-[90px] flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-3', 'min-h-[60px] flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-1.5');
sk = sk.replace('gap-2">\n', 'gap-1">\n'); // for items list

fs.writeFileSync('src/pages/stock/StockKho.tsx', sk, 'utf8');
console.log('Optimized StockKho spacing');
