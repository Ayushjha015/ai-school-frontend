import type { PropsWithChildren } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export function LoadingScreen({ label = 'Loading...' }: PropsWithChildren<{ label?: string }>) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 ${isDark ? 'bg-slate-950/40' : 'bg-slate-950/5'}`}>
      <div className={`flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border p-10 text-center shadow-lg backdrop-blur ${isDark ? 'border-slate-700 bg-slate-900/90 shadow-black/20' : 'border-white/70 bg-white/85 shadow-slate-900/5'}`}>
        <div className={`h-12 w-12 animate-spin rounded-full border-4 ${isDark ? 'border-slate-700 border-t-emerald-400' : 'border-slate-200 border-t-emerald-500'}`} />
        <div>
          <p className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>One moment</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}
