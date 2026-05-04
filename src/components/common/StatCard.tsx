import { formatPercentage } from '../../utils/formatters';
import { getStatIcon, type AppIcon } from '../../utils/appIcons';
import type { StatusAccent } from '../../utils/statusStyles';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  accent?: StatusAccent;
  icon?: AppIcon;
  className?: string;
}

export const statCardSurfaceStyles: Record<StatusAccent, string> = {
  emerald: 'border-emerald-200 bg-emerald-50/75 dark:border-emerald-800/70 dark:bg-emerald-950/35',
  blue: 'border-blue-200 bg-blue-50/75 dark:border-blue-800/70 dark:bg-blue-950/35',
  amber: 'border-amber-200 bg-amber-50/80 dark:border-amber-800/70 dark:bg-amber-950/35',
  slate: 'border-slate-200 bg-slate-50/85 dark:border-slate-700 dark:bg-slate-900/70',
  rose: 'border-rose-200 bg-rose-50/80 dark:border-rose-800/70 dark:bg-rose-950/35',
};

export const statCardIconStyles: Record<StatusAccent, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/20',
  blue: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/20',
  amber: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/20',
  slate: 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-400/10 dark:text-slate-200 dark:ring-slate-400/15',
  rose: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/15 dark:text-rose-200 dark:ring-rose-400/20',
};

export function StatCard({ label, value, helper, accent = 'slate', icon, className = '' }: StatCardProps) {
  const displayValue = typeof value === 'number' && label.toLowerCase().includes('average') ? formatPercentage(value) : value;
  const Icon = icon ?? getStatIcon(label);

  return (
    <div className={`min-w-0 rounded-[22px] border p-5 shadow-sm ${statCardSurfaceStyles[accent]} ${className}`}>
      <div className="flex items-start gap-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statCardIconStyles[accent]}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 break-words text-3xl font-semibold leading-none text-slate-950 [overflow-wrap:anywhere] dark:text-slate-50">{displayValue}</p>
        </div>
      </div>
      {helper ? <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">{helper}</p> : null}
    </div>
  );
}
