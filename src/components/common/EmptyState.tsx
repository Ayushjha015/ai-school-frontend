import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`rounded-3xl border border-dashed p-8 text-center shadow-sm ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-300 bg-white/70'}`}>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className={`mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${isDark ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-700'}`}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
