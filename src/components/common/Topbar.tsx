import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUnreadCountQuery } from '../../hooks/useNotificationQueries';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';

interface TopbarProps {
  onMenuOpen?: () => void;
  onDesktopSidebarToggle?: () => void;
  isDesktopSidebarCollapsed?: boolean;
}

export function Topbar({ onMenuOpen, onDesktopSidebarToggle, isDesktopSidebarCollapsed = false }: TopbarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data } = useUnreadCountQuery(Boolean(user));

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  }

  return (
    <header className="rounded-[28px] border border-white/70 bg-white/85 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {onMenuOpen ? (
              <button
                type="button"
                onClick={onMenuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white lg:hidden"
                aria-label="Open navigation menu"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                </span>
              </button>
            ) : null}
            {onDesktopSidebarToggle ? (
              <button
                type="button"
                onClick={onDesktopSidebarToggle}
                className="hidden h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white lg:inline-flex"
                aria-label={isDesktopSidebarCollapsed ? 'Show navigation menu' : 'Hide navigation menu'}
              >
                {isDesktopSidebarCollapsed ? 'Show menu' : 'Hide menu'}
              </button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Student portal</p>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">Welcome back, {user?.name ?? 'Student'}</h2>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          to="/student/notifications"
          className="relative inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white sm:w-auto"
        >
          Notifications
          {data?.count ? (
            <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">{data.count}</span>
          ) : null}
        </Link>
        <div className="flex min-w-0 w-full items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:w-auto sm:max-w-[360px]">
          <span className="min-w-0 truncate font-semibold text-slate-900" title={user?.email ?? ''}>
            {user?.email}
          </span>
          <span className="shrink-0 text-slate-500">{formatRoleLabel(user?.role ?? 'STUDENT')}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
