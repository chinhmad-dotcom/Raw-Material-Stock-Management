import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LoginForm({ onForgotPassword }: { onForgotPassword?: () => void }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await fetch('http://localhost:5147/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed.');
      }

      // Login success
      login(result.token, result.user, data.rememberMe);
      navigate('/');
    } catch (error: any) {
      setGlobalError(error.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {globalError && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('auth.emailLabel', 'Email')}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter company email"
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 ${
                errors.email ? 'border-rose-500' : 'border-white/10'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('auth.passwordLabel', 'Password')}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 pr-10 ${
                errors.password ? 'border-rose-500' : 'border-white/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-rose-400">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-0 focus:ring-offset-transparent"
            />
            <span className="text-slate-300 text-xs">{t('auth.rememberMe', 'Remember me')}</span>
          </label>
          <button type="button" onClick={onForgotPassword} className="font-medium text-sky-400 transition hover:text-sky-300 text-xs">{t('auth.forgotPassword', 'Forgot password?')}</button>
        </div>

        <div className="pt-2">
            <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400 focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('auth.loginLoading', 'LOGGING IN...') : t('auth.loginButton', 'LOG IN')}
            </button>
        </div>
      </form>
    </div>
  );
}
