import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0 rounded-3xl bg-white/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{portalLabel}</p>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      <nav className="min-h-0 space-y-2 overflow-y-auto pr-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) => {
              const resolvedActive = link.isActiveForPath ? link.isActiveForPath(location.pathname) : isActive;
              return `block rounded-2xl px-4 py-3 text-sm font-medium transition ${resolvedActive
                ? 'bg-white text-white shadow-lg shadow-white/10 dark:bg-slate-100 dark:text-white dark:shadow-white/10'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`;
            }}
            end={!link.isActiveForPath}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function RoleSidebar({ portalLabel, title, description, links, mobileOpen = false, onClose, desktopCollapsed = false }: RoleSidebarProps) {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

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
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Close navigation menu"
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col border-r border-white/10 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/30 transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Menu</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <SidebarContent portalLabel={portalLabel} title={title} description={description} links={links} onNavigate={onClose} />
        </aside>
      </div>

      <div
        className={`hidden lg:block lg:sticky lg:top-6 lg:self-start ${desktopCollapsed ? 'pointer-events-none' : ''}`}
        aria-hidden={desktopCollapsed}
      >
        <div
          className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-in-out ${desktopCollapsed ? 'max-w-0 -translate-x-4 opacity-0' : 'max-w-xs translate-x-0 opacity-100'
            }`}
        >
          <aside className="w-full rounded-[28px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/20 lg:flex lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
            <SidebarContent portalLabel={portalLabel} title={title} description={description} links={links} />
          </aside>
        </div>
      </div>
    </>
  );
}
