const fs = require('fs');

const sidebarCode = `import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, Settings } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex h-full">
      <div className="group relative flex h-full w-3 hover:w-64 transition-all duration-300 z-50">
        
        <aside className="absolute left-0 top-0 h-full w-64 -translate-x-full bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 p-4 shadow-[15px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:translate-x-0 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 mt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <Boxes className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100">STOCK<span className="text-sky-400">RM</span></h1>
          </div>
          
          <nav className="flex flex-col gap-1 mt-4">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu</p>
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path}
                className={\`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition \${
                  location.pathname === item.path 
                    ? 'bg-sky-500/10 text-sky-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }\`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', sidebarCode);
console.log('Sidebar cleaned up');
