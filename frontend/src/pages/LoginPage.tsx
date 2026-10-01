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
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("/factory-bg.png")` }}
      />
      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-black/20 pointer-events-none" />

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
          className="px-3 py-1.5 rounded-lg bg-black/30 text-xs font-bold text-white hover:bg-black/50 transition backdrop-blur-md border border-white/20 shadow-lg"
        >
          {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
        </button>
      </div>
  
      {/* Auth Card Wrapper */}
      <div className="relative z-10 w-full max-w-[400px] px-4 sm:px-0 flex flex-col justify-center max-h-screen py-4">
        
        {/* Header / Logo (Outside form, visible on background) */}
        <div className="mb-4 sm:mb-6 text-center flex flex-col items-center shrink-0">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-sky-600 ring-1 ring-white/50 shadow-2xl backdrop-blur-md">
            <Boxes className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-white drop-shadow-lg mb-1">
            STOCK<span className="text-sky-400">RM</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.1em] text-white/90 drop-shadow-md uppercase">{t('auth.industrialDashboard', 'Industrial Dashboard')}</p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl sm:rounded-[2rem] border border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 overflow-y-auto custom-scrollbar">
          
          {/* Toggle Tabs */}
          {view !== 'forgot-password' && (
            <div className="flex w-full mb-6 rounded-xl bg-slate-100/80 dark:bg-slate-950/50 p-1 border border-slate-200/50 dark:border-white/5 shrink-0">
            <button 
              onClick={() => setView('login')}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all \${view === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >{t('auth.loginTab', 'Log In')}</button>
            <button 
              onClick={() => setView('register')}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all \${view === 'register' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
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

          <div className="shrink-0 text-slate-900 dark:text-slate-100">
            {view === 'login' && <LoginForm onForgotPassword={() => setView('forgot-password')} />}
            {view === 'register' && <RegisterForm />}
            {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('login')} />}
          </div>
        </div>

        {/* Footer info (Outside form, visible on background) */}
        <div className="mt-6 sm:mt-8 text-center text-[10px] text-white/80 drop-shadow-md shrink-0 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} STOCKRM. Secured by Industrial Standards.
        </div>
      </div>
    </div>
  );
}
