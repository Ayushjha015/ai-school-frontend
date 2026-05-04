import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StudentSidebar } from '../components/student/StudentSidebar';
import { Topbar } from '../components/common/Topbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

export function StudentLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();
  const location = useLocation();
  const isExamAttemptRoute = /^\/student\/exams\/[^/]+\/attempt$/.test(location.pathname);

  if (isExamAttemptRoute) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <main className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1600px] sm:min-h-[calc(100vh-3rem)]">
          <Outlet />
        </main>
      </div>
    );
  }

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
