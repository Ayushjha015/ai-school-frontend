import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../theme/ThemeProvider';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '16px',
          background: isDark ? '#111827' : '#0f172a',
          color: '#f8fafc',
          border: isDark ? '1px solid #334155' : '1px solid transparent',
        },
      }}
    />
  );
}
