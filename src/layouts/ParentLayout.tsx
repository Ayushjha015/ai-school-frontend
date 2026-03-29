import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSidebar } from '../components/role/RoleSidebar';
import { RoleTopbar } from '../components/role/RoleTopbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

const links = [
  { to: '/parent/dashboard', label: 'Dashboard' },
  { to: '/parent/children', label: 'My Children' },
  { to: '/parent/notifications', label: 'Notifications' },
  { to: '/parent/profile', label: 'Profile' },
];

export function ParentLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <RoleSidebar
        portalLabel="Parishkan AI"
        title="Parent Desk"
        description="Follow each linked child’s exam schedule, results, and progress without changing the student workspace."
        links={links}
        mobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        desktopCollapsed={isCollapsed}
      />
      <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 sm:gap-6 lg:min-h-[calc(100vh-3rem)]">
        <RoleTopbar
          portalName="Parent portal"
          welcomeFallback="Parent"
          notificationsPath="/parent/notifications"
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
