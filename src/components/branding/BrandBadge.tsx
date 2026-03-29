import logoDark from '../../assets/parishkan-ai-logo-dark.svg';
import logoLight from '../../assets/parishkan-ai-logo-light.svg';
import { APP_NAME } from '../../branding';
import { useTheme } from '../../theme/ThemeProvider';

interface BrandBadgeProps {
  label?: string;
  textClassName?: string;
  iconClassName?: string;
}

export function BrandBadge({ label = APP_NAME, textClassName = 'text-emerald-200', iconClassName = 'h-9 w-9' }: BrandBadgeProps) {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? logoDark : logoLight;

  return (
    <div className="flex items-center gap-3">
      <img src={logoSrc} alt={`${label} logo`} className={`shrink-0 ${iconClassName}`} />
      <span className={`text-xs font-semibold uppercase tracking-[0.28em] ${textClassName}`}>{label}</span>
    </div>
  );
}
