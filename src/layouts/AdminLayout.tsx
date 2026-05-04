import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSidebar } from '../components/role/RoleSidebar';
import { RoleTopbar } from '../components/role/RoleTopbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

function isAdminSectionActive(pathname: string, section: string) {
  return pathname === `/admin/${section}` || pathname.startsWith(`/admin/${section}/`);
}

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  {
    to: '/admin/teachers',
    label: 'Teachers',
    isActiveForPath: (pathname: string) => isAdminSectionActive(pathname, 'teachers'),
  },
  {
    to: '/admin/students',
    label: 'Students',
    isActiveForPath: (pathname: string) => isAdminSectionActive(pathname, 'students') && pathname !== '/admin/students/bulk-upload',
  },
  {
    to: '/admin/students/bulk-upload',
    label: 'Bulk Upload',
    isActiveForPath: (pathname: string) => pathname === '/admin/students/bulk-upload',
  },
  {
    to: '/admin/groups',
    label: 'Classes',
    isActiveForPath: (pathname: string) => isAdminSectionActive(pathname, 'groups'),
  },
  { to: '/admin/subjects', label: 'Subjects' },
  {
    to: '/admin/exams',
    label: 'Exams',
    isActiveForPath: (pathname: string) => isAdminSectionActive(pathname, 'exams'),
  },
  {
    to: '/admin/analytics',
    label: 'Analytics',
    isActiveForPath: (pathname: string) => isAdminSectionActive(pathname, 'analytics'),
  },
  { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <RoleSidebar
        portalLabel="Parishkan AI"
        title="Org Admin Hub"
        description="Run teachers, students, classes, subjects, exams, analytics, and notifications for your organization."
        links={links}
        mobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        desktopCollapsed={isCollapsed}
      />
      <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 sm:gap-6 lg:min-h-[calc(100vh-3rem)]">
        <RoleTopbar
          portalName="Admin portal"
          welcomeFallback="Org Admin"
          notificationsPath="/admin/notifications"
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
