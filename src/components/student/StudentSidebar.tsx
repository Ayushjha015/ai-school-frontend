import { RoleSidebar } from '../role/RoleSidebar';

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/exams', label: 'My Exams' },
  { to: '/student/results', label: 'My Results' },
  { to: '/student/analytics', label: 'Analytics' },
  { to: '/student/notifications', label: 'Notifications' },
  { to: '/student/profile', label: 'Profile' },
];

interface StudentSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  desktopCollapsed?: boolean;
}

export function StudentSidebar({ mobileOpen = false, onClose, desktopCollapsed = false }: StudentSidebarProps) {
  return (
    <RoleSidebar
      portalLabel="AI School"
      title="Student Hub"
      description="Your exams, results, analytics, and notifications in one place."
      links={links}
      mobileOpen={mobileOpen}
      onClose={onClose}
      desktopCollapsed={desktopCollapsed}
    />
  );
}
