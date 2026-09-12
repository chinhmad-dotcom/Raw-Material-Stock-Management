import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function RegisterForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch('http://localhost:5147/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      setSuccessMsg(result.message || 'Registration successful. Account is pending admin approval.');
    } catch (error: any) {
      setGlobalError(error.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {successMsg && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}
      {globalError && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('auth.fullNameLabel', 'Full Name')}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder={t('auth.fullNamePlaceholder', 'Enter your full name')}
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 ${
                errors.name ? 'border-rose-500' : 'border-white/10'
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('auth.emailLabel', 'Email')}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder={t('auth.emailPlaceholder', 'name@company.com')}
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 ${
                errors.email ? 'border-rose-500' : 'border-white/10'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
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
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 ${
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('auth.confirmPasswordLabel', 'Confirm Password')}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              className={`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 ${
                errors.confirmPassword ? 'border-rose-500' : 'border-white/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2">
            <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400 focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? t('auth.registerLoading', 'REGISTERING...') : t('auth.registerButton', 'CREATE ACCOUNT')}
            </button>
        </div>
      </form>
    </div>
  );
}
