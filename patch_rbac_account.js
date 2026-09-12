const fs = require('fs');

let code = fs.readFileSync('frontend/src/features/settings/components/AccountTab.tsx', 'utf8');

// 1. Add useAuthStore import
code = code.replace(
  `import { useForm } from 'react-hook-form';`,
  `import { useForm } from 'react-hook-form';\nimport { useAuthStore } from '../../auth/store/authStore';`
);

// 2. Add currentUser logic
code = code.replace(
  `export function AccountTab() {\n  const [users, setUsers] = useState<User[]>([]);`,
  `export function AccountTab() {\n  const currentUser = useAuthStore(state => state.user);\n  const isAdmin = currentUser?.role === 'Admin';\n\n  const [users, setUsers] = useState<User[]>([]);`
);

// 3. Hide "Add User" button for non-admins
code = code.replace(
  `<button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-400">\n          <Plus className="h-4 w-4" /> Add User\n        </button>`,
  `{isAdmin && (
          <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-400">
            <Plus className="h-4 w-4" /> Add User
          </button>
        )}`
);

// 4. Hide actions column header for non-admins
code = code.replace(
  `<th className="px-4 py-3 text-right font-medium">Actions</th>`,
  `{isAdmin && <th className="px-4 py-3 text-right font-medium">Actions</th>}`
);

// 5. Hide actions column for non-admins
code = code.replace(
  `<td className="px-4 py-3 text-right">\n                  <div className="flex justify-end gap-2">\n                    {(user.status === 'pending' || user.status === 'Pending') && (\n                      <button onClick={() => handleApprove(user)} title="Approve Registration" className="rounded p-1 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400">\n                        <CheckCircle className="h-4 w-4" />\n                      </button>\n                    )}\n                    <button onClick={() => handleResetPassword(user)} title="Reset Password" className={\`rounded p-1 \${user.resetRequested ? 'text-amber-400 hover:bg-amber-500/20' : 'text-slate-400 hover:bg-white/10 hover:text-sky-400'}\`}>\n                      <KeyRound className="h-4 w-4" />\n                    </button>\n                    <button onClick={() => openModal(user)} title="Edit User" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-sky-400"><Edit2 className="h-4 w-4" /></button>\n                    <button onClick={() => handleDelete(user.id)} title="Delete User" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>\n                  </div>\n                </td>`,
  `{isAdmin && (
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
                )}`
);

fs.writeFileSync('frontend/src/features/settings/components/AccountTab.tsx', code);
console.log('RBAC applied to AccountTab');
