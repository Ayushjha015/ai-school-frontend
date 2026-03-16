import { formatPercentage } from '../../utils/formatters';
import { useTheme } from '../../theme/ThemeProvider';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';
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

export function StatCard({ label, value, helper, accent = 'slate' }: StatCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const accentStyles = isDark ? darkAccentStyles : lightAccentStyles;
  const displayValue = typeof value === 'number' && label.toLowerCase().includes('average') ? formatPercentage(value) : value;

  return (
    <div className={`min-w-0 rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${accentStyles[accent]}`}>
      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-3 break-words text-3xl font-semibold leading-tight [overflow-wrap:anywhere] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{displayValue}</p>
      {helper ? <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{helper}</p> : null}
    </div>
  );
}
