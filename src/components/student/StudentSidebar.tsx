import { RoleSidebar } from '../role/RoleSidebar';

function isStudentSectionActive(pathname: string, section: string) {
  return pathname === `/student/${section}` || pathname.startsWith(`/student/${section}/`);
}

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  {
    to: '/student/exams',
    label: 'My Exams',
    isActiveForPath: (pathname: string) => isStudentSectionActive(pathname, 'exams'),
  },
  {
    to: '/student/results',
    label: 'My Results',
    isActiveForPath: (pathname: string) => isStudentSectionActive(pathname, 'results'),
  },
  {
    to: '/student/analytics',
    label: 'Analytics',
    isActiveForPath: (pathname: string) => isStudentSectionActive(pathname, 'analytics'),
  },
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
      portalLabel="Parishkan AI"
      title="Student Hub"
      description="Your exams, results, analytics, and notifications in one place."
      links={links}
      mobileOpen={mobileOpen}
      onClose={onClose}
      desktopCollapsed={desktopCollapsed}
    />
  );
}
