const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/fans/FanPlanList.tsx', 'utf8');

// Change filterMonth to filterYear
code = code.replace(/const currentMonthStr = new Date\(\)\.toISOString\(\)\.slice\(0, 7\); \/\/ YYYY-MM/, 'const currentYearStr = new Date().getFullYear().toString();');
code = code.replace(/const \[filterMonth, setFilterMonth\] = useState\(currentMonthStr\);/, 'const [filterYear, setFilterYear] = useState(currentYearStr);');

code = code.replace(/const rMonth = r.planStart \? r.planStart.slice\(0, 7\) : '';/, "const rYear = r.planStart ? new Date(r.planStart).getFullYear().toString() : '';");
code = code.replace(/return r.siloName === filterSilo && rMonth === filterMonth;/, 'return r.siloName === filterSilo && rYear === filterYear;');

// Change the input type="month" to a Year dropdown or number input
code = code.replace(
  /<input \s*type="month"\s*value=\{filterMonth\}\s*onChange=\{e => setFilterMonth\(e.target.value\)\}\s*className="[^"]*"\s*\/>/,
  `<input 
            type="number" 
            min="2020" max="2100" step="1"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2 py-1 border outline-none w-[70px]"
          />`
);

// Fix the empty state message
code = code.replace(
  /Chưa có dữ liệu cho tháng và bồn này/,
  'Chưa có dữ liệu cho năm và bồn này'
);

fs.writeFileSync('frontend/src/components/fans/FanPlanList.tsx', code);
console.log('FanPlanList updated to use Year instead of Month');
