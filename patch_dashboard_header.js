const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/dashboard/DashboardPage.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  `import { Activity, AlertTriangle, Layers, Zap } from 'lucide-react';`,
  `import { Activity, AlertTriangle, Layers, Zap, User, LogOut, Settings, ChevronDown } from 'lucide-react';\nimport { useAuthStore } from '../../features/auth/store/authStore';\nimport { Link } from 'react-router-dom';`
);

// 2. Add auth store hooks and state
code = code.replace(
  `export function DashboardPage() {`,
  `export function DashboardPage() {\n  const { user, logout } = useAuthStore();\n  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);`
);

// 3. Replace the two header spans
const oldHeaderRegex = /<div className="flex flex-wrap items-center gap-2 sm:gap-3">\s*<span[^>]*>\s*<Activity[^>]*>\s*\{summary \? `Updated \$\{new Date\(summary\.generatedAt\)\.toLocaleString\(\)\}` : 'Loading\.\.\.'\}\s*<\/span>\s*<span[^>]*>\s*<Zap[^>]*>\s*\{summary\?\.criticalAlertCount \?\? 0\} Critical Alerts\s*<\/span>\s*<\/div>/s;

const newHeader = `<div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950/90 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-slate-900 transition"
            >
              <User className="h-4 w-4 text-sky-400" /> 
              <span className="font-semibold">{user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <p className="text-[10px] uppercase text-emerald-400 mt-1">{user?.role}</p>
                </div>
                <div className="py-1">
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button onClick={() => logout()} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>`;

code = code.replace(oldHeaderRegex, newHeader);

fs.writeFileSync('frontend/src/components/dashboard/DashboardPage.tsx', code);
console.log('Dashboard patched!');
