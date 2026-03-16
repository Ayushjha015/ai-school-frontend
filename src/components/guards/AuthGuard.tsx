import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingScreen } from '../common/LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const status = useAuthStore((state) => state.status);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (isBootstrapping || status === 'loading') {
    return <LoadingScreen label="Loading your workspace..." />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
