import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { BrandBadge } from '../../components/branding/BrandBadge';
import { useAuthStore } from '../../store/authStore';
import type { ValidationErrorResponse } from '../../types/api';
import { parseValidationErrors } from '../../utils/parseValidationErrors';
import { getRoleDashboard } from '../../utils/roleRedirect';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [navigate, user]);

  async function onSubmit(values: LoginFormData) {
    try {
      const signedInUser = await login(values.email, values.password);
      toast.success('Welcome back.');
      navigate(getRoleDashboard(signedInUser.role), { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<ValidationErrorResponse>;
      if (axiosError.response?.status === 422) {
        const fieldErrors = parseValidationErrors(axiosError.response.data);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof LoginFormData, { type: 'server', message });
        });
        return;
      }

      toast.error('Login failed. Please check your credentials and try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:rounded-[36px]">
        <section className="hidden bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10 lg:block lg:px-14 lg:py-16">
          <BrandBadge textClassName="text-emerald-300" />
          <h1 className="mt-6 max-w-lg text-3xl font-semibold leading-tight sm:text-5xl">
            Organization login for a connected academic workspace.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Sign in to continue to the right dashboard for your role, whether you manage classes, track results, follow student progress, or monitor exams.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:mt-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Role-aware access</p>
              <p className="mt-2 text-sm text-slate-300">Teachers, students, and parents are routed to the workspace that fits their responsibilities.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Secure continuity</p>
              <p className="mt-2 text-sm text-slate-300">Keep exam operations, progress tracking, and notifications connected in one secure flow.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-5 text-white sm:px-8 sm:py-9 lg:bg-transparent lg:px-12 lg:py-14 lg:text-inherit">
          <div className="mx-auto max-w-md">
            <div className="mb-5 lg:hidden">
              <BrandBadge textClassName="text-emerald-300" />
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Organization access</p>
            </div>

            <p className="hidden text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 lg:block">Organization access</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl lg:mt-3 lg:text-slate-900">Log in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300 lg:mt-3 lg:text-slate-600">
              Use your account email and password to continue into your organization workspace.
            </p>

            <form className="mt-6 space-y-4 lg:mt-8 lg:space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 lg:text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register('email')}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 lg:border-slate-200 lg:bg-white lg:text-slate-900 lg:focus:ring-emerald-100"
                  placeholder="name@organization.com"
                />
                {form.formState.errors.email ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 lg:text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register('password')}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 lg:border-slate-200 lg:bg-white lg:text-slate-900 lg:focus:ring-emerald-100"
                  placeholder="Minimum 8 characters"
                />
                {form.formState.errors.password ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.password.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting || status === 'loading'}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.formState.isSubmitting || status === 'loading' ? 'Signing in...' : 'Secure sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm leading-6 text-slate-400 lg:mt-8 lg:text-slate-500">
              After sign-in, the app will take you to the right workspace automatically based on your assigned role.
            </p>
            <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-slate-200 underline-offset-4 hover:underline lg:text-slate-700">
              Return to homepage
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
