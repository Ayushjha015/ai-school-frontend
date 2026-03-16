import { useTheme } from '../../theme/ThemeProvider';

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, eyebrow, action, children }: SectionCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <section className={`rounded-[28px] border p-6 shadow-lg backdrop-blur ${isDark ? 'border-slate-700 bg-slate-900/85 shadow-black/20' : 'border-white/70 bg-white/85 shadow-slate-900/5'}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{eyebrow}</p> : null}
          <h2 className={`mt-1 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
