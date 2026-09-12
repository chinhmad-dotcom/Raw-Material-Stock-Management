import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
