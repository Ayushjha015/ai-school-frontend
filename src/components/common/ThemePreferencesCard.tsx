import { useTheme, type ThemeMode } from '../../theme/ThemeProvider';
import { SectionCard } from './SectionCard';

const options: Array<{ value: ThemeMode; label: string; description: string }> = [
  { value: 'light', label: 'Light', description: 'Keep the current bright workspace theme.' },
  { value: 'dark', label: 'Dark', description: 'Use the new dark appearance for lower-light viewing.' },
  { value: 'system', label: 'System default', description: 'Follow your device theme automatically.' },
];

export function ThemePreferencesCard() {
  const { mode, resolvedTheme, setMode } = useTheme();

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
                    ? 'border-emerald-400 bg-emerald-50 text-slate-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
