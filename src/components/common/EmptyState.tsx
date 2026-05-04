import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { getActionIcon, getEmptyStateIcon, type AppIcon } from '../../utils/appIcons';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: AppIcon;
}

export function EmptyState({ title, description, actionLabel, actionTo, icon }: EmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const Icon = icon ?? getEmptyStateIcon(title);
  const ActionIcon = actionLabel ? getActionIcon(actionLabel) : null;

  return (
    <div className={`rounded-3xl border border-dashed p-8 text-center shadow-sm ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-300 bg-white/70'}`}>
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${isDark ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-700'}`}
        >
          {ActionIcon ? <ActionIcon className="h-4 w-4 shrink-0" aria-hidden /> : null}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
