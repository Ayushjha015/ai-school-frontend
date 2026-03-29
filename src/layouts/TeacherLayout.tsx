import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSidebar } from '../components/role/RoleSidebar';
import { RoleTopbar } from '../components/role/RoleTopbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

const links = [
  { to: '/teacher/dashboard', label: 'Dashboard' },
  { to: '/teacher/groups', label: 'My Classes' },
  { to: '/teacher/students', label: 'Students' },
  {
    to: '/teacher/questions',
    label: 'Question Bank',
    isActiveForPath: (pathname: string) => pathname === '/teacher/questions' || pathname === '/teacher/questions/new',
  },
  {
    to: '/teacher/questions/ai-generate',
    label: 'AI Generate',
    isActiveForPath: (pathname: string) => pathname === '/teacher/questions/ai-generate',
  },
  { to: '/teacher/exams', label: 'Exams' },
  { to: '/teacher/notifications', label: 'Notifications' },
  { to: '/teacher/profile', label: 'Profile' },
];

export function TeacherLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <RoleSidebar
        portalLabel="Parishkan AI"
        title="Teacher Studio"
        description="Manage classes, question banks, exam publishing, analytics, and student progress from one workspace."
        links={links}
        mobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        desktopCollapsed={isCollapsed}
      />
      <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 sm:gap-6 lg:min-h-[calc(100vh-3rem)]">
        <RoleTopbar
          portalName="Teacher portal"
          welcomeFallback="Teacher"
          notificationsPath="/teacher/notifications"
          onMenuOpen={() => setIsMobileNavOpen(true)}
          onDesktopSidebarToggle={toggle}
          isDesktopSidebarCollapsed={isCollapsed}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
