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
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
          className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20 transition backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm"
        >
          {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
        </button>
      </div>
  
      {/* Background Pattern - Industrial Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-10 dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%2364748b' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/20 dark:bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-400/20 dark:bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[400px] px-4 sm:px-0 flex flex-col justify-center max-h-screen">
        
        {/* Header / Logo */}
        <div className="mb-4 sm:mb-6 text-center flex flex-col items-center shrink-0">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 ring-1 ring-slate-200 dark:ring-white/10 shadow-lg dark:shadow-[0_0_30px_rgba(14,165,233,0.15)]">
            <Boxes className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-800 dark:text-slate-100 mb-1">
            STOCK<span className="text-sky-500 dark:text-sky-400">RM</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase">{t('auth.industrialDashboard', 'Industrial Dashboard')}</p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-5 sm:p-7 shadow-xl dark:shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 overflow-y-auto custom-scrollbar">
          
          {/* Toggle Tabs */}
          {view !== 'forgot-password' && (
            <div className="flex w-full mb-6 rounded-xl bg-slate-100 dark:bg-slate-950/50 p-1 border border-slate-200 dark:border-white/5 shrink-0">
            <button 
              onClick={() => setView('login')}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all \${view === 'login' ? 'bg-sky-500 text-white dark:text-slate-950 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >{t('auth.loginTab', 'Log In')}</button>
            <button 
              onClick={() => setView('register')}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all \${view === 'register' ? 'bg-sky-500 text-white dark:text-slate-950 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >{t('auth.registerTab', 'Register')}</button>
          </div>
          )}

          <div className="mb-5 text-center shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              {view === 'login' ? 'Log in to the warehouse management system' : view === 'register' ? 'Register a new account to access the system' : 'We will send a reset request to your admin.'}
            </p>
          </div>

          <div className="shrink-0">
            {view === 'login' && <LoginForm onForgotPassword={() => setView('forgot-password')} />}
            {view === 'register' && <RegisterForm />}
            {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('login')} />}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 sm:mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          &copy; {new Date().getFullYear()} STOCKRM. Secured by Industrial Standards.
        </div>
      </div>
    </div>
  );
}
