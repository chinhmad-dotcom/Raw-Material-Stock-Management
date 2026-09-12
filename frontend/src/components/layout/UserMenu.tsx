import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useThemeStore } from '../../store/themeStore';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 shrink-0" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm backdrop-blur-md"
      >
        <User className="h-4 w-4 text-sky-600 dark:text-sky-400" /> 
        <span className="font-semibold">{user?.role?.toLowerCase() === 'admin' ? 'Admin' : (user?.name || 'User')}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {user?.role}
            </span>
          </div>
          
          <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('usermenu.theme', 'Theme')}</span>
            <button onClick={() => toggleTheme()} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
          <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('header.language', 'Ngôn ngữ')}</span>
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
            </button>
          </div>
  
          <div className="py-1">
            <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition">
              <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" /> {t('sidebar.settings', 'Settings')}
            </Link>
            <button onClick={() => logout()} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
              <LogOut className="h-4 w-4" /> {t('sidebar.logout', 'Đăng xuất')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
