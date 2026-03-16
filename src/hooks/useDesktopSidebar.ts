import { useEffect, useState } from 'react';

const STORAGE_KEY = 'app.desktop-sidebar-collapsed';

function getStoredValue() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function useDesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(getStoredValue);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return {
    isCollapsed,
    toggle: () => setIsCollapsed((current) => !current),
    setIsCollapsed,
  };
}
