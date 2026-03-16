import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingScreen } from '../common/LoadingScreen';
import type { RoleName } from '../../types/api';

interface RoleGuardProps {
  allowedRoles: RoleName[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (isBootstrapping || status === 'loading') {
    return <LoadingScreen label="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
