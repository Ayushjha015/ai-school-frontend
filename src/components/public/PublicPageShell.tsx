import { BrandBadge } from '../branding/BrandBadge';
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
        <header className="rounded-[28px] border px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div>
            <BrandBadge textClassName={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
            <h1 className={`mt-4 max-w-6xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-slate-50' : 'text-slate-950'}`}>{title}</h1>
            <p className={`mt-4 max-w-4xl text-sm leading-7 sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
          </div>
        </header>

        <div>
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{eyebrow}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
