import { useTheme } from '../../theme/ThemeProvider';
import { DotPattern } from './DotPattern';

interface AppBackgroundLayerProps {
  className?: string;
}

export function AppBackgroundLayer({ className = '' }: AppBackgroundLayerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_34%)]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.07),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%)]'
        }`}
      />
      <DotPattern
        dotColor={isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.12)'}
        gap={24}
        dotSize={1.1}
        className={isDark ? 'opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]' : 'opacity-70 [mask-image:radial-gradient(68%_58%_at_50%_38%,black,transparent)]'}
      />
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.22))]'
            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22))]'
        }`}
      />
    </div>
  );
}
