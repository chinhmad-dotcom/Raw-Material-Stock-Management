import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Invalid email address.'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setGlobalError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch('http://localhost:5147/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to request password reset.');
      }

      setSuccessMsg(result.message || 'Password reset request sent successfully.');
    } catch (error: any) {
      setGlobalError(error.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
      >
        <ArrowLeft className="h-4 w-4" /> BACK TO LOGIN
      </button>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
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

        <div className="pt-2">
            <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400 focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'SENDING REQUEST...' : 'RESET PASSWORD'}
            </button>
        </div>
      </form>
    </div>
  );
}
