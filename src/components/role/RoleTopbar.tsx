import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUnreadCountQuery } from '../../hooks/useNotificationQueries';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';
import { appIcons, getActionIcon } from '../../utils/appIcons';

interface RoleTopbarProps {
  portalName: string;
  welcomeFallback: string;
  notificationsPath: string;
  notificationsLabel?: string;
  showUnreadCount?: boolean;
  onMenuOpen?: () => void;
  onDesktopSidebarToggle?: () => void;
  isDesktopSidebarCollapsed?: boolean;
}

export function RoleTopbar({
  portalName,
  welcomeFallback,
  notificationsPath,
  notificationsLabel = 'Notifications',
  showUnreadCount = true,
  onMenuOpen,
  onDesktopSidebarToggle,
  isDesktopSidebarCollapsed = false,
}: RoleTopbarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data } = useUnreadCountQuery(Boolean(user) && showUnreadCount);

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  }

  return (
    <header className="rounded-[24px] border border-white/70 bg-white/85 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {onMenuOpen ? (
              <button
                type="button"
                onClick={onMenuOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white lg:hidden"
                aria-label="Open navigation menu"
              >
                <appIcons.Menu className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
            {onDesktopSidebarToggle ? (
              <button
                type="button"
                onClick={onDesktopSidebarToggle}
                className="group hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition-all duration-300 ease-out hover:border-slate-300 hover:bg-white hover:shadow-md lg:inline-flex"
                aria-label={isDesktopSidebarCollapsed ? 'Open navigation menu' : 'Close navigation menu'}
                title={isDesktopSidebarCollapsed ? 'Open menu' : 'Close menu'}
              >
                <ChevronLeft
                  className={`h-5 w-5 transition-transform duration-300 ease-out ${isDesktopSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}
                  aria-hidden="true"
                  strokeWidth={2.25}
                />
              </button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{portalName}</p>
          </div>
          <h2 className="mt-3 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">Welcome back, {user?.name ?? welcomeFallback}</h2>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          to={notificationsPath}
          className="relative inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white sm:w-auto"
        >
          {(() => {
            const Icon = getActionIcon(notificationsLabel);
            return <Icon className="h-4 w-4 shrink-0" aria-hidden />;
          })()}
          {notificationsLabel}
          {showUnreadCount && data?.count ? <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">{data.count}</span> : null}
        </Link>
        <div className="flex min-w-0 w-full items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 sm:w-auto sm:max-w-[360px]">
          <span className="flex min-w-0 items-center gap-2 truncate font-semibold text-slate-900" title={user?.email ?? ''}>
            <appIcons.Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            {user?.email}
          </span>
          <span className="shrink-0 text-slate-500">{formatRoleLabel(user?.role ?? 'student')}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <appIcons.LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Logout
        </button>
      </div>
    </header>
  );
}
