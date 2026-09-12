const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Loader2, X, CheckCircle, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  resetRequested?: boolean;
}

interface UserFormData {
  email: string;
  name: string;
  role: string;
  status: string;
}

export function AccountTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<UserFormData>();

  const fetchUsers = () => {
    fetch('http://localhost:5147/api/settings/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setIsLoading(false); })
      .catch(console.error);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setValue('email', user.email);
      setValue('name', user.name || '');
      setValue('role', user.role);
      setValue('status', user.status);
    } else {
      setEditingUser(null);
      reset({ email: '', name: '', role: 'Operator', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    const url = 'http://localhost:5147/api/settings/users';
    const method = 'POST';
    const payload = editingUser ? { ...data, id: editingUser.id } : data;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsModalOpen(false);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await fetch(\`http://localhost:5147/api/settings/users/\${id}\`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  const handleApprove = async (user: User) => {
    await fetch(\`http://localhost:5147/api/settings/users/\${user.id}/approve\`, {
      method: 'POST'
    });
    fetchUsers();
  };

  const handleResetPassword = async (user: User) => {
    if (confirm('Reset password to 123456?')) {
      await fetch(\`http://localhost:5147/api/settings/users/\${user.id}/reset-password\`, {
        method: 'POST'
      });
      alert('Password reset successfully to 123456');
      fetchUsers();
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-sky-500" /></div>;

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">User Management</h2>
        <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-400">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-slate-950/50">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="sticky top-0 bg-slate-900 z-10 border-b border-white/10 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-slate-200">
                  {user.name || 'N/A'}
                  {user.resetRequested && <span className="ml-2 text-[10px] text-amber-400 border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 rounded-full">Reset Requested</span>}
                </td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={\`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold \${
                    user.role === 'Admin' ? 'bg-fuchsia-500/10 text-fuchsia-400' : 
                    user.role === 'Manager' ? 'bg-sky-500/10 text-sky-400' : 
                    user.role === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                  }\`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={\`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold \${
                    user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                    (user.status === 'pending' || user.status === 'Pending') ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }\`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {(user.status === 'pending' || user.status === 'Pending') && (
                      <button onClick={() => handleApprove(user)} title="Approve Registration" className="rounded p-1 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleResetPassword(user)} title="Reset Password" className={\`rounded p-1 \${user.resetRequested ? 'text-amber-400 hover:bg-amber-500/20' : 'text-slate-400 hover:bg-white/10 hover:text-sky-400'}\`}>
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button onClick={() => openModal(user)} title="Edit User" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-sky-400"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(user.id)} title="Delete User" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Name</label>
                <input {...register('name')} type="text" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Email</label>
                <input {...register('email', { required: true })} type="email" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Role</label>
                <select {...register('role')} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Status</label>
                <select {...register('status')} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500">
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/features/settings/components/AccountTab.tsx', code);
console.log('Rewrote AccountTab.tsx');
