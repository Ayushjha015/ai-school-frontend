import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '../components/student/StudentSidebar';
import { Topbar } from '../components/common/Topbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

export function StudentLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <StudentSidebar mobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} desktopCollapsed={isCollapsed} />
      <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 sm:gap-6 lg:min-h-[calc(100vh-3rem)]">
        <Topbar onMenuOpen={() => setIsMobileNavOpen(true)} onDesktopSidebarToggle={toggle} isDesktopSidebarCollapsed={isCollapsed} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
