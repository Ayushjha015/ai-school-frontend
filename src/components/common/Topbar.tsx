import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUnreadCountQuery } from '../../hooks/useNotificationQueries';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';
import { appIcons } from '../../utils/appIcons';

interface TopbarProps {
  onMenuOpen?: () => void;
  onDesktopSidebarToggle?: () => void;
  isDesktopSidebarCollapsed?: boolean;
}

export function Topbar({ onMenuOpen, onDesktopSidebarToggle, isDesktopSidebarCollapsed = false }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const { data } = useUnreadCountQuery(Boolean(user));

  return (
    <header className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuOpen ? (
            <button
              type="button"
              onClick={onMenuOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white lg:hidden"
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
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">Student portal</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A focused overview of your classes, exams, results, and updates today.</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:justify-end">
        <div className="min-w-0 flex-1 text-right sm:flex-none">
          <p className="truncate text-sm font-semibold leading-5 text-slate-950">{user?.name ?? 'Student'}</p>
          <p className="truncate text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-slate-500" title={user?.email ?? ''}>
            {user?.email}
          </p>
        </div>
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700" title={formatRoleLabel(user?.role ?? 'STUDENT')}>
          <appIcons.UserRound className="h-5 w-5" aria-hidden />
        </div>
        <Link
          to="/student/notifications"
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
          aria-label="Notifications"
          title="Notifications"
        >
          <appIcons.Bell className="h-5 w-5 shrink-0" aria-hidden />
          {data?.count ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white">{data.count}</span>
          ) : null}
        </Link>
        </div>
      </div>
    </header>
  );
}
