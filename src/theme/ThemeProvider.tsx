import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app.theme-mode';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const initialMode = getStoredMode();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(initialMode === 'system' ? getSystemTheme() : initialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);

    if (mode === 'system') {
      setResolvedTheme(getSystemTheme());
      return;
    }

    setResolvedTheme(mode);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange() {
      if (mode === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    }

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = mode;
  }, [mode, resolvedTheme]);

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
