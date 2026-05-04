import { formatPercentage } from '../../utils/formatters';
import { useTheme } from '../../theme/ThemeProvider';
import { getStatIcon, type AppIcon } from '../../utils/appIcons';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';
  icon?: AppIcon;
}

const lightAccentStyles = {
  emerald: 'from-emerald-400/20 to-emerald-100 border-emerald-200',
  blue: 'from-blue-400/20 to-blue-100 border-blue-200',
  amber: 'from-amber-400/20 to-amber-100 border-amber-200',
  slate: 'from-slate-300/20 to-white border-slate-200',
  rose: 'from-rose-400/20 to-rose-100 border-rose-200',
};

const darkAccentStyles = {
  emerald: 'from-emerald-500/18 to-slate-900 border-emerald-800/70',
  blue: 'from-blue-500/18 to-slate-900 border-blue-800/70',
  amber: 'from-amber-500/18 to-slate-900 border-amber-800/70',
  slate: 'from-slate-700/35 to-slate-900 border-slate-700',
  rose: 'from-rose-500/18 to-slate-900 border-rose-800/70',
};

const lightIconStyles = {
  emerald: 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/20',
  amber: 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/20',
  slate: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/15',
  rose: 'bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/20',
};

const darkIconStyles = {
  emerald: 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20',
  blue: 'bg-blue-400/15 text-blue-200 ring-1 ring-blue-400/20',
  amber: 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20',
  slate: 'bg-slate-400/10 text-slate-200 ring-1 ring-slate-400/15',
  rose: 'bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/20',
};

export function StatCard({ label, value, helper, accent = 'slate', icon }: StatCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const accentStyles = isDark ? darkAccentStyles : lightAccentStyles;
  const iconStyles = isDark ? darkIconStyles : lightIconStyles;
  const displayValue = typeof value === 'number' && label.toLowerCase().includes('average') ? formatPercentage(value) : value;
  const Icon = icon ?? getStatIcon(label);

  return (
    <div className={`min-w-0 rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${accentStyles[accent]}`}>
      <div className="flex items-start gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconStyles[accent]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className={`mt-3 break-words text-3xl font-semibold leading-tight [overflow-wrap:anywhere] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{displayValue}</p>
        </div>
      </div>
      {helper ? <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{helper}</p> : null}
    </div>
  );
}
