import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { SectionCard } from './SectionCard';

const options: Array<{ value: ThemeMode; label: string; description: string }> = [
  { value: 'light', label: 'Light', description: 'Keep the current bright workspace theme.' },
  { value: 'dark', label: 'Dark', description: 'Use the new dark appearance for lower-light viewing.' },
  { value: 'system', label: 'System default', description: 'Follow your device theme automatically.' },
];

export function ThemePreferencesCard() {
  const { mode, resolvedTheme, setMode } = useTheme();
  const selectedClasses =
    resolvedTheme === 'dark'
      ? 'border-emerald-400/80 bg-slate-900 text-slate-50 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]'
      : 'border-emerald-400 bg-white text-slate-900 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]';
  const unselectedClasses =
    resolvedTheme === 'dark'
      ? 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-slate-600 hover:bg-slate-900'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

  return (
    <SectionCard title="Preferences" eyebrow="Appearance">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-700">Choose your theme</p>
          <p className="mt-1 text-sm text-slate-600">Current appearance: <span className="font-semibold capitalize">{resolvedTheme}</span></p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {options.map((option) => {
            const isSelected = mode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded-3xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? selectedClasses
                    : unselectedClasses
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className={`mt-2 text-sm leading-6 ${isSelected ? (resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600') : resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
