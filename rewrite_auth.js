const fs = require('fs');

const loginPageCode = `import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Background Pattern - Industrial Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: \`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")\`,
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
          <h1 className="text-3xl font-bold tracking-wider text-slate-100 mb-2">
            STOCK<span className="text-sky-400">RM</span>
          </h1>
          <p className="text-sm font-medium tracking-[0.1em] text-slate-400 uppercase">
            Industrial Dashboard
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 transition-all duration-300">
          
          {/* Toggle Tabs */}
          <div className="flex w-full mb-8 rounded-xl bg-slate-950/50 p-1 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={\`flex-1 rounded-lg py-2 text-sm font-semibold transition-all \${isLogin ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}\`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={\`flex-1 rounded-lg py-2 text-sm font-semibold transition-all \${!isLogin ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}\`}
            >
              Register
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-100">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              {isLogin ? 'Log in to the warehouse management system' : 'Register a new account to access the system'}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} STOCKRM. Secured by Industrial Standards.
        </div>
      </div>
    </div>
  );
}
`;

const loginFormCode = `import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter company email"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 \${
                errors.email ? 'border-rose-500' : 'border-white/10'
              }\`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 pr-10 \${
                errors.password ? 'border-rose-500' : 'border-white/10'
              }\`}
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
            <span className="text-slate-300 text-xs">Remember me</span>
          </label>
          <a href="#" className="font-medium text-sky-400 transition hover:text-sky-300 text-xs">
            Forgot password?
          </a>
        </div>

        <div className="pt-2">
            <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400 focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
        </div>
      </form>
    </div>
  );
}
`;

const registerFormCode = `import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function RegisterForm() {
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="Enter your full name"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 \${
                errors.name ? 'border-rose-500' : 'border-white/10'
              }\`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter company email"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 \${
                errors.email ? 'border-rose-500' : 'border-white/10'
              }\`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 \${
                errors.password ? 'border-rose-500' : 'border-white/10'
              }\`}
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={\`w-full rounded-xl border bg-slate-900/50 pl-11 pr-10 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 \${
                errors.confirmPassword ? 'border-rose-500' : 'border-white/10'
              }\`}
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
            {isLoading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
            </button>
        </div>
      </form>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/LoginPage.tsx', loginPageCode);
fs.writeFileSync('frontend/src/features/auth/components/LoginForm.tsx', loginFormCode);
fs.writeFileSync('frontend/src/features/auth/components/RegisterForm.tsx', registerFormCode);

console.log('Successfully recreated auth files with perfect English');
