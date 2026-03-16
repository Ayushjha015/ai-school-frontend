import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PublicPageShell({ eyebrow, title, description, children }: PublicPageShellProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div
        className={`mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[32px] border p-4 shadow-2xl backdrop-blur sm:p-6 lg:p-8 ${isDark ? 'border-slate-800 bg-slate-950/80 shadow-black/20' : 'border-white/70 bg-white/70 shadow-slate-900/10'}`}
      >
        <header className="flex flex-col gap-5 rounded-[28px] border px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-7">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>AI School</p>
            <h1 className={`mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-slate-50' : 'text-slate-950'}`}>{title}</h1>
            <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <Link
              to="/"
              className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition ${isDark ? 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500' : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-400'}`}
            >
              Home
            </Link>
            <Link
              to="/login"
              className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition ${isDark ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              Organization login
            </Link>
            <Link
              to="/register-org"
              className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition ${isDark ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
            >
              Register your org
            </Link>
          </nav>
        </header>

        <div>
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{eyebrow}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
