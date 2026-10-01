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
    <div className="dark relative flex min-h-[100dvh] items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("/factory-bg.png")` }}
      />
      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-black/30 pointer-events-none backdrop-blur-[2px]" />

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')} 
          className="px-3 py-1.5 rounded-lg bg-black/30 text-xs font-bold text-white hover:bg-black/50 transition backdrop-blur-md border border-white/20 shadow-lg"
        >
          {i18n.language === 'vi' ? 'VI / en' : 'vi / EN'}
        </button>
      </div>
  
      {/* Auth Card Wrapper - Reduced padding/margins to fit vertically without scrolling */}
      <div className="relative z-10 w-full max-w-[400px] px-4 sm:px-0 flex flex-col justify-center max-h-screen">
        
        {/* Header / Logo */}
        <div className="mb-3 text-center flex flex-col items-center shrink-0">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sky-400 ring-1 ring-white/30 shadow-2xl backdrop-blur-md">
            <Boxes className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-widest text-white drop-shadow-lg mb-1">
            STOCK<span className="text-sky-400">RM</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-white/90 drop-shadow-md uppercase">{t('auth.industrialDashboard', 'Industrial Dashboard')}</p>
        </div>

        {/* Form Container - Glassmorphism */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300">
          
          {/* Toggle Tabs */}
          {view !== 'forgot-password' && (
            <div className="flex w-full mb-4 rounded-xl bg-black/20 p-1 border border-white/10 shrink-0">
            <button 
              onClick={() => setView('login')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all \${view === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
            >{t('auth.loginTab', 'Log In')}</button>
            <button 
              onClick={() => setView('register')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all \${view === 'register' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}
            >{t('auth.registerTab', 'Register')}</button>
          </div>
          )}

          <div className="mb-4 text-center shrink-0">
            <h2 className="text-lg font-bold text-white drop-shadow-sm">
              {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="mt-1 text-[10px] text-slate-200">
              {view === 'login' ? 'Log in to the warehouse management system' : view === 'register' ? 'Register a new account to access the system' : 'We will send a reset request to your admin.'}
            </p>
          </div>

          <div className="shrink-0 text-slate-100">
            {view === 'login' && <LoginForm onForgotPassword={() => setView('forgot-password')} />}
            {view === 'register' && <RegisterForm />}
            {view === 'forgot-password' && <ForgotPasswordForm onBack={() => setView('login')} />}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[10px] text-white/80 drop-shadow-md shrink-0 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} STOCKRM. Secured by Industrial Standards.
        </div>
      </div>
    </div>
  );
}
