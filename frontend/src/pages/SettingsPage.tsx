import { UserMenu } from '../components/layout/UserMenu';
﻿import { useState, useEffect } from 'react';
import { Users, Container, Database, Terminal, Sun, Moon } from 'lucide-react';
import { AccountTab } from '../features/settings/components/AccountTab';
import { SiloTab } from '../features/settings/components/SiloTab';
import { MaterialsTab } from '../features/settings/components/MaterialsTab';
import { LogsTab } from '../features/settings/components/LogsTab';
import { ProfileTab } from '../features/settings/components/ProfileTab';
import { useAuthStore } from '../features/auth/store/authStore';
import { useThemeStore } from '../store/themeStore';

type Tab = 'profile' | 'accounts' | 'silos' | 'materials' | 'logs';

import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t } = useTranslation();
  const currentUser = useAuthStore(state => state.user);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    if (!isAdmin && activeTab === 'accounts') {
      setActiveTab('profile');
    }
  }, [isAdmin, activeTab]);

  const tabs = [
    { id: 'profile', label: t('pages.settings.tabs.profile', 'My Profile'), icon: <Users className="h-4 w-4" /> },
    { id: 'accounts', label: t('pages.settings.tabs.accounts', 'Account Management'), icon: <Users className="h-4 w-4" /> },
    { id: 'silos', label: t('pages.settings.tabs.silos', 'Location parameters'), icon: <Container className="h-4 w-4" /> },
    { id: 'materials', label: t('pages.settings.tabs.materials', 'Raw Materials & Rules'), icon: <Database className="h-4 w-4" /> },
    { id: 'logs', label: t('pages.settings.tabs.logs', 'Audit & Mail Logs'), icon: <Terminal className="h-4 w-4" /> },
  ] as const;

  const visibleTabs = isAdmin ? tabs : tabs.filter(t => t.id !== 'accounts');

  return (
    <div className="flex h-screen w-full flex-col gap-4 px-2 py-2 sm:px-4">
      <div className="flex items-center justify-between relative z-50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('pages.settings.title', 'System Settings')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('pages.settings.subtitle', 'Manage system configuration, users, and audit logs')}</p>
        </div>
        <UserMenu />
      </div>

      <div className="flex space-x-1 rounded-xl bg-white dark:bg-slate-900/50 p-1 border border-slate-200 dark:border-white/5">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'accounts' && isAdmin && <AccountTab />}
        {activeTab === 'silos' && <SiloTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
}

