const fs = require('fs');
let code = fs.readFileSync('src/features/settings/components/SiloTab.tsx', 'utf8');

// 1. Add Trash2 import
code = code.replace(/import \{ Loader2, Edit2, X \} from 'lucide-react';/, "import { Loader2, Edit2, X, Trash2 } from 'lucide-react';");

// 2. Add deleteLocation function
const fetchDataRegex = /const fetchData = async \(\) => \{/;
const deleteFunc = `
  const deleteLocation = async (item: MergedLocation) => {
    if (!item.configId) {
      alert('Location này đang sử dụng dữ liệu mặc định từ Excel và chưa có cấu hình riêng để xóa.');
      return;
    }
    if (confirm(\`Bạn có chắc chắn muốn xóa cấu hình của location \${item.siloCode}?\`)) {
      try {
        await fetch(\`http://localhost:5147/api/settings/silos/\${item.configId}\`, {
          method: 'DELETE'
        });
        fetchData();
      } catch (error) {
        console.error('Lỗi xóa location:', error);
      }
    }
  };

  const fetchData = async () => {`;
code = code.replace(fetchDataRegex, deleteFunc);

// 3. Add Delete Button next to Edit Button
const editBtnRegex = /<button onClick=\{\(\) => openModal\(item\)\} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-white\/10 hover:text-emerald-400"><Edit2 className="h-3 w-3" \/><\/button>/g;
const combinedBtns = `<div className="flex justify-end gap-1">
                      <button onClick={() => openModal(item)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-emerald-500 transition-colors" title="Chỉnh sửa"><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => deleteLocation(item)} className="rounded p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors" title="Xóa cấu hình"><Trash2 className="h-3 w-3" /></button>
                    </div>`;
code = code.replace(editBtnRegex, combinedBtns);

fs.writeFileSync('src/features/settings/components/SiloTab.tsx', code, 'utf8');
console.log('Added delete button to SiloTab');
