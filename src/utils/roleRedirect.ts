import type { RoleName } from '../types/api';

const dashboardByRole: Record<RoleName, string> = {
  super_admin: '/super-admin/dashboard',
  org_admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
};

export function getRoleDashboard(role: RoleName) {
  return dashboardByRole[role] ?? '/login';
}
