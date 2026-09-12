const fs = require('fs');

let code = `import { useState, useEffect } from 'react';
import { Users, Container, Database, Terminal } from 'lucide-react';
import { AccountTab } from '../features/settings/components/AccountTab';
import { SiloTab } from '../features/settings/components/SiloTab';
import { MaterialsTab } from '../features/settings/components/MaterialsTab';
import { LogsTab } from '../features/settings/components/LogsTab';
import { useAuthStore } from '../features/auth/store/authStore';

type Tab = 'accounts' | 'silos' | 'materials' | 'logs';

export function SettingsPage() {
  const currentUser = useAuthStore(state => state.user);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  
  const [activeTab, setActiveTab] = useState<Tab>(isAdmin ? 'accounts' : 'silos');

  useEffect(() => {
    if (!isAdmin && activeTab === 'accounts') {
      setActiveTab('silos');
    }
  }, [isAdmin, activeTab]);

  const tabs = [
    { id: 'accounts', label: 'Account Management', icon: <Users className="h-4 w-4" /> },
    { id: 'silos', label: 'Location parameters', icon: <Container className="h-4 w-4" /> },
    { id: 'materials', label: 'Raw Materials & Rules', icon: <Database className="h-4 w-4" /> },
    { id: 'logs', label: 'Audit & Mail Logs', icon: <Terminal className="h-4 w-4" /> },
  ] as const;

  const visibleTabs = isAdmin ? tabs : tabs.filter(t => t.id !== 'accounts');

  return (
    <div className="flex h-screen w-full flex-col gap-4 px-2 py-2 sm:px-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage system configuration, users, and audit logs</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-900/50 p-1 border border-white/5">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={\`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all \${
              activeTab === tab.id
                ? 'bg-slate-800 text-emerald-400 shadow'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }\`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'accounts' && isAdmin && <AccountTab />}
        {activeTab === 'silos' && <SiloTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/SettingsPage.tsx', code);
console.log('SettingsPage updated with RBAC');
