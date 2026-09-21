import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, Settings, PackageOpen, Container, Factory, Truck, FileText, ChevronDown, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard className="h-10 w-10" /> },
    { name: t('sidebar.stockKho', 'Stock Kho'), path: '/stock-kho', icon: <PackageOpen className="h-10 w-10" /> },
    { name: t('sidebar.stockSilo', 'Stock Silo'), path: '/stock-silo', icon: <Container className="h-10 w-10" /> },
    { name: t('sidebar.extruder', 'Extruder'), path: '/extruder', icon: <Factory className="h-10 w-10" /> },
    { name: 'Truck Tracking', path: '/truck-tracking', icon: <Truck className="h-10 w-10" /> },
    { 
      name: t('sidebar.reports', 'Báo Cáo'), 
      icon: <FileText className="h-10 w-10" />,
      subItems: [
        { name: 'Báo cáo mở quạt', path: '/reports/fans' },
        { name: 'Báo cáo phun trùng', path: '/reports/fumigation' }
      ]
    },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-10 w-10" /> },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-[100] flex h-full">
      <div className="group relative flex h-full w-3 hover:w-80 transition-all duration-300 z-[100]">
        
        <aside className="absolute left-0 top-0 h-full w-80 -translate-x-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 p-6 shadow-[15px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:translate-x-0 flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2 mt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Boxes className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-100">STOCK<span className="text-sky-400">RM</span></h1>
          </div>
          
          <nav className="flex flex-col gap-0.5 mt-2 flex-1 overflow-y-auto">
            <p className="px-3 mb-1 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('sidebar.menu', 'Menu')}</p>
            {navItems.map((item) => {
              if (item.subItems) {
                const isActive = item.subItems.some(sub => location.pathname === sub.path);
                const isExpanded = expandedMenus[item.name] || false;
                
                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <button 
                      onClick={() => setExpandedMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                      className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-lg font-semibold transition hover:bg-slate-100 dark:hover:bg-white/5 ${isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {item.name}
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 opacity-70" /> : <ChevronRight className="w-5 h-5 opacity-70" />}
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col ml-11 gap-1 border-l-2 border-slate-200 dark:border-slate-800 pl-4 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                        {item.subItems.map(sub => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className={`text-sm font-medium py-1.5 transition ${location.pathname === sub.path ? 'text-sky-500 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link 
                  key={item.name} 
                  to={item.path || '#'}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-lg font-semibold transition ${
                    location.pathname === item.path 
                      ? 'bg-sky-500/10 text-sky-400' 
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </div>
  );
}



