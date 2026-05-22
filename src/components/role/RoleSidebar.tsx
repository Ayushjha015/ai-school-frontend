import { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BrandBadge } from '../branding/BrandBadge';
import { appIcons, getNavigationIcon } from '../../utils/appIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/authStore';

interface RoleLink {
  to: string;
  label: string;
  isActiveForPath?: (pathname: string) => boolean;
}

interface RoleSidebarProps {
  portalLabel: string;
  title: string;
  description: string;
  links: RoleLink[];
  mobileOpen?: boolean;
  onClose?: () => void;
  desktopCollapsed?: boolean;
}

function SidebarContent({ portalLabel, title, description, links, onNavigate }: { portalLabel: string; title: string; description: string; links: RoleLink[]; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  async function handleLogout() {
    await logout();
    onNavigate?.();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`shrink-0 border-b px-5 py-5 ${isDark ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
        <BrandBadge
          label={portalLabel}
          iconClassName="h-8 w-8"
          textClassName={isDark ? 'text-emerald-200' : 'text-slate-950'}
        />
        <h1 className={`mt-4 text-lg font-semibold leading-tight ${isDark ? 'text-slate-50' : 'text-slate-950'}`}>{title}</h1>
        <p className={`mt-1.5 text-[11px] leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
      </div>

      {/* Scrollable nav with hidden scrollbar */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) => {
              const resolvedActive = link.isActiveForPath ? link.isActiveForPath(location.pathname) : isActive;
              const activeClasses = isDark
                ? 'bg-slate-800/80 text-slate-50 shadow-sm shadow-black/20'
                : 'bg-blue-100/70 text-slate-950 shadow-sm shadow-blue-200/40';
              const inactiveClasses = isDark
                ? 'text-slate-300 hover:bg-slate-800/55 hover:text-white'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-950';

              return `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${resolvedActive ? activeClasses : inactiveClasses}`;
            }}
            end={!link.isActiveForPath}
          >
            {({ isActive }) => {
              const resolvedActive = link.isActiveForPath ? link.isActiveForPath(location.pathname) : isActive;
              const Icon = getNavigationIcon(link.label);

              return (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition ${
                      resolvedActive ? 'bg-indigo-500 opacity-100' : 'bg-transparent opacity-0'
                    }`}
                  />
                  <Icon className={`h-4 w-4 shrink-0 transition ${resolvedActive ? (isDark ? 'text-slate-50' : 'text-indigo-700') : ''}`} aria-hidden />
                  <span className="min-w-0 truncate">{link.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      <div className={`shrink-0 border-t px-3 py-4 ${isDark ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isDark ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-rose-600 text-white shadow-sm shadow-rose-200 hover:bg-rose-700'
          }`}
        >
          <appIcons.LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function RoleSidebar({ portalLabel, title, description, links, mobileOpen = false, onClose, desktopCollapsed = false }: RoleSidebarProps) {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const previousPathname = useRef(location.pathname);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (mobileOpen && previousPathname.current !== location.pathname) {
      onClose?.();
    }

    previousPathname.current = location.pathname;
  }, [location.pathname, mobileOpen, onClose]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Close navigation menu"
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(86vw,16.5rem)] flex-col border-r shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out overflow-hidden ${
            isDark
              ? 'border-slate-800 bg-slate-950/90 text-slate-100 shadow-black/40'
              : 'border-slate-200 bg-slate-50/95 text-slate-900 shadow-slate-900/20'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Menu</p>
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isDark
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Close navigation menu"
            >
              {(() => {
                const Icon = getNavigationIcon('close');
                return <Icon className="h-4 w-4 rotate-180" aria-hidden />;
              })()}
            </button>
          </div>
          <SidebarContent portalLabel={portalLabel} title={title} description={description} links={links} onNavigate={onClose} />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:block lg:sticky lg:top-6 lg:self-start overflow-hidden rounded-[24px] ${desktopCollapsed ? 'pointer-events-none' : ''}`}
        aria-hidden={desktopCollapsed}
      >
        <div
          className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-in-out ${
            desktopCollapsed ? 'max-w-0 -translate-x-5 opacity-0' : 'max-w-[260px] translate-x-0 opacity-100'
          }`}
        >
          <aside
            className={`w-[260px] overflow-hidden rounded-[24px] border shadow-xl backdrop-blur-2xl lg:flex lg:h-[calc(100vh-3rem)] ${
              isDark
                ? 'border-slate-800/90 bg-slate-950/75 text-slate-100 shadow-black/25'
                : 'border-slate-200/90 bg-slate-50/90 text-slate-900 shadow-slate-900/10'
            }`}
          >
            <SidebarContent portalLabel={portalLabel} title={title} description={description} links={links} />
          </aside>
        </div>
      </div>
    </>
  );
}
