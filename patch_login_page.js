const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/LoginPage.tsx', 'utf8');

const oldImports = `import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';`;

const newImports = `import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';`;

code = code.replace(oldImports, newImports);

code = code.replace(
  'const [isLogin, setIsLogin] = useState(true);',
  `type AuthView = 'login' | 'register' | 'forgot-password';\n  const [view, setView] = useState<AuthView>('login');`
);

code = code.replace(
  `onClick={() => setIsLogin(true)}`,
  `onClick={() => setView('login')}`
);
code = code.replace(
  `onClick={() => setIsLogin(false)}`,
  `onClick={() => setView('register')}`
);
code = code.replace(
  `isLogin ? 'bg-sky-500 text-slate-950 shadow-md'`,
  `view === 'login' ? 'bg-sky-500 text-slate-950 shadow-md'`
);
code = code.replace(
  `!isLogin ? 'bg-sky-500 text-slate-950 shadow-md'`,
  `view === 'register' ? 'bg-sky-500 text-slate-950 shadow-md'`
);
code = code.replace(
  `{isLogin ? 'Welcome Back' : 'Create Account'}`,
  `{view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Reset Password'}`
);
code = code.replace(
  `{isLogin ? 'Log in to the warehouse management system' : 'Register a new account to access the system'}`,
  `{view === 'login' ? 'Log in to the warehouse management system' : view === 'register' ? 'Register a new account to access the system' : 'We will send a reset request to your admin.'}`
);

code = code.replace(
  `{isLogin ? <LoginForm /> : <RegisterForm />}`,
  `{view === 'login' && <LoginForm onForgotPassword={() => setView('forgot-password')} />}\n          {view === 'register' && <RegisterForm />}\n          {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('login')} />}`
);

// Hide toggle tabs if view is forgot-password
code = code.replace(
  `<div className="flex w-full mb-8 rounded-xl bg-slate-950/50 p-1 border border-white/5">`,
  `{view !== 'forgot-password' && (\n            <div className="flex w-full mb-8 rounded-xl bg-slate-950/50 p-1 border border-white/5">`
);
code = code.replace(
  `Register\n            </button>\n          </div>`,
  `Register\n            </button>\n          </div>\n          )}`
);

fs.writeFileSync('frontend/src/pages/LoginPage.tsx', code);
console.log('LoginPage updated');
