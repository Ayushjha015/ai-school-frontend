import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSidebar } from '../components/role/RoleSidebar';
import { RoleTopbar } from '../components/role/RoleTopbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/teachers', label: 'Teachers' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/students/bulk-upload', label: 'Bulk Upload' },
  { to: '/admin/groups', label: 'Groups' },
  { to: '/admin/subjects', label: 'Subjects' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <RoleSidebar
        portalLabel="AI School"
        title="Org Admin Hub"
        description="Run teachers, students, groups, subjects, exams, analytics, and notifications for your organization."
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
