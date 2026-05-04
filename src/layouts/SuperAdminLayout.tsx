import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSidebar } from '../components/role/RoleSidebar';
import { RoleTopbar } from '../components/role/RoleTopbar';
import { useDesktopSidebar } from '../hooks/useDesktopSidebar';

function isSuperAdminSectionActive(pathname: string, section: string) {
  return pathname === `/super-admin/${section}` || pathname.startsWith(`/super-admin/${section}/`);
}

const links = [
  { to: '/super-admin/dashboard', label: 'Dashboard' },
  {
    to: '/super-admin/organizations',
    label: 'Organizations',
    isActiveForPath: (pathname: string) =>
      isSuperAdminSectionActive(pathname, 'organizations') && pathname !== '/super-admin/organizations/new',
  },
  {
    to: '/super-admin/tags',
    label: 'Tags',
    isActiveForPath: (pathname: string) => isSuperAdminSectionActive(pathname, 'tags'),
  },
  {
    to: '/super-admin/organizations/new',
    label: 'Create Organization',
    isActiveForPath: (pathname: string) => pathname === '/super-admin/organizations/new',
  },
  {
    to: '/super-admin/org-admins/new',
    label: 'Create Org Admin',
    isActiveForPath: (pathname: string) => pathname === '/super-admin/org-admins/new',
  },
  { to: '/super-admin/settings', label: 'Settings' },
];

export function SuperAdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggle } = useDesktopSidebar();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <RoleSidebar
        portalLabel="Parishkan AI"
        title="Control Center"
        description="Manage organizations, branches, and organization administrators across the full platform."
        links={links}
        mobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        desktopCollapsed={isCollapsed}
      />
      <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 sm:gap-6 lg:min-h-[calc(100vh-3rem)]">
        <RoleTopbar
          portalName="Super admin portal"
          welcomeFallback="Super Admin"
          notificationsPath="/super-admin/settings"
          notificationsLabel="Settings"
          showUnreadCount={false}
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
