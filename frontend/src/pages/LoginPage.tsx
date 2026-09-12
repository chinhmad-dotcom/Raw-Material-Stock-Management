import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  type AuthView = 'login' | 'register' | 'forgot-password';
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
          className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-300 hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
        >
          {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
        </button>
      </div>
  
      {/* Background Pattern - Industrial Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        
        {/* Header / Logo */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-white/10 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
            <Boxes className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-slate-900 dark:text-slate-100 mb-2">
            STOCK<span className="text-sky-400">RM</span>
          </h1>
          <p className="text-sm font-medium tracking-[0.1em] text-slate-600 dark:text-slate-400 uppercase">{t('auth.industrialDashboard', 'Industrial Dashboard')}</p>
        </div>

        {/* Form Container */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 transition-all duration-300">
          
          {/* Toggle Tabs */}
          {view !== 'forgot-password' && (
            <div className="flex w-full mb-8 rounded-xl bg-slate-100 dark:bg-slate-950/50 p-1 border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setView('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${view === 'login' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}`}
            >{t('auth.loginTab', 'Log In')}</button>
            <button 
              onClick={() => setView('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${view === 'register' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}`}
            >{t('auth.registerTab', 'Register')}</button>
          </div>
          )}

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {view === 'login' ? 'Log in to the warehouse management system' : view === 'register' ? 'Register a new account to access the system' : 'We will send a reset request to your admin.'}
            </p>
          </div>

          {view === 'login' && <LoginForm onForgotPassword={() => setView('forgot-password')} />}
          {view === 'register' && <RegisterForm />}
          {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('login')} />}

        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} STOCKRM. Secured by Industrial Standards.
        </div>
      </div>
    </div>
  );
}

