import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/shared/auth/AuthContext';
import { LogOut, PanelLeftClose, PanelLeftOpen, Moon, Sun, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { territoireService } from '@/modules/territoire/services/territoireService';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { InstallPrompt } from '@/shared/components/InstallPrompt';
import { NotificationBell } from '@/shared/components/NotificationBell';
import { MaintenanceBanner } from '@/shared/components/MaintenanceBanner';
import { NAV_GROUPS, EXTRA_PAGE_TITLES, isNavItemVisible, navKey, groupKey, type NavItem } from './navigation';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export function AppLayout() {
  const { user, logout, hasPermission } = useAuthContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [territoireNom, setTerritoireNom] = useState<string | null>(null);

  useEffect(() => {
    if (user?.territoireId && user.niveau >= 1 && user.niveau <= 5) {
      territoireService.getById(user.territoireId)
        .then((t) => setTerritoireNom(t.nom))
        .catch(() => setTerritoireNom(null));
    }
  }, [user?.territoireId, user?.niveau]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPage = NAV_GROUPS.flatMap((g) => g.items).find(
    (item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'),
  );

  const renderNavItems = (
    items: NavItem[],
    onNavigate?: () => void,
  ) => {
    const visible = items.filter((item) => isNavItemVisible(item, hasPermission));
    return visible.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'relative flex h-11 w-full items-center rounded-md transition-all duration-200',
            isActive
              ? 'bg-kct-gold/10 dark:bg-kct-gold/20 text-kct-gold font-medium border-l-2 border-kct-gold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-kct-noir dark:hover:text-gray-200',
          )
        }
      >
        <div className="grid h-full w-12 place-content-center shrink-0">
          <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <span className="text-sm font-medium transition-opacity duration-200 whitespace-nowrap">
            {t('nav.items.' + navKey(item.to), { defaultValue: item.label })}
          </span>
        )}
      </NavLink>
    ));
  };

  return (
    <div className={cn('flex min-h-screen w-full', isDark && 'dark')}>
      <OfflineBanner />
      <InstallPrompt />
      <div className="flex w-full bg-kct-beige dark:bg-gray-950 text-kct-noir dark:text-gray-100">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out hidden lg:block',
            collapsed ? 'w-16' : 'w-64',
            'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm',
          )}
        >
          {/* Logo */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4 pt-4 px-3">
            <div className="flex items-center gap-3 rounded-md p-1">
              <img src="/kamer_cine_talents.jpg" alt="KCT" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              {!collapsed && (
                <div className="transition-opacity duration-200 overflow-hidden">
                  <span className="block text-sm font-bold text-kct-noir dark:text-gray-100 leading-tight">
                    KAMER CINÉ
                  </span>
                  <span className="block text-xs text-kct-gold font-medium">Talents Manager</span>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <div className="overflow-y-auto h-[calc(100vh-180px)] flex flex-col gap-4 mt-3 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {NAV_GROUPS.map((group, idx) => {
              const visibleItems = group.items.filter((item) => isNavItemVisible(item, hasPermission));
              if (visibleItems.length === 0) return null;
              return (
                <div key={idx} className="flex flex-col gap-0.5">
                  {!collapsed && group.heading && (
                    <span className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                      {t('nav.groups.' + groupKey(group.heading), { defaultValue: group.heading })}
                    </span>
                  )}
                  {renderNavItems(group.items)}
                </div>
              );
            })}
          </div>

          {/* Collapse toggle */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="grid h-10 w-10 place-content-center shrink-0">
                {collapsed ? (
                  <PanelLeftOpen className="h-[18px] w-[18px] text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                ) : (
                  <PanelLeftClose className="h-[18px] w-[18px] text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                )}
              </div>
              {!collapsed && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200">
                  {t('layout.collapse')}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-4 pt-4 px-3">
                <div className="flex items-center gap-3">
                  <img src="/kamer_cine_talents.jpg" alt="KCT" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <span className="block text-sm font-bold text-kct-noir dark:text-gray-100 leading-tight">
                      KAMER CINÉ
                    </span>
                    <span className="block text-xs text-kct-gold font-medium">Talents Manager</span>
                  </div>
                </div>
              </div>
              <nav className="mt-3 px-2 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-80px)]">
                {NAV_GROUPS.map((group, idx) => {
                  const visibleItems = group.items.filter((item) => isNavItemVisible(item, hasPermission));
                  if (visibleItems.length === 0) return null;
                  return (
                    <div key={idx} className="flex flex-col gap-0.5">
                      {group.heading && (
                        <span className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                          {t('nav.groups.' + groupKey(group.heading), { defaultValue: group.heading })}
                        </span>
                      )}
                      {renderNavItems(group.items, () => setMobileOpen(false))}
                    </div>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header bar */}
          <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-kct-noir dark:text-gray-100">
                    {(() => {
                      const extra = EXTRA_PAGE_TITLES.find(([p]) => location.pathname.startsWith(p));
                      if (extra) return t(extra[1]);
                      return currentPage ? t('nav.items.' + navKey(currentPage.to), { defaultValue: currentPage.label }) : t('layout.defaultTitle');
                    })()}
                  </h1>
                  {user && (
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                      user.niveau === 0 && 'bg-kct-gold/15 text-kct-gold',
                      user.niveau === 1 && 'bg-kct-gold/15 text-kct-gold',
                      user.niveau === 2 && 'bg-[#B8860B]/15 text-[#B8860B]',
                      user.niveau === 3 && 'bg-[#C9A227]/15 text-[#C9A227]',
                      user.niveau === 4 && 'bg-[#3F9142]/15 text-[#3F9142]',
                      user.niveau === 5 && 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                    )}>
                      {user.niveau === 0 ? 'SYS' : `N${user.niveau}`}{territoireNom ? ` — ${territoireNom}` : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {user?.nom} — {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? t('layout.lightMode') : t('layout.darkMode')}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-kct-gold" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-500" />
                )}
              </button>

              <LanguageSwitcher />

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <NavLink
                  to="/profile"
                  className="hidden sm:flex flex-col items-end rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={t('layout.myProfile')}
                >
                  <span className="text-sm font-medium text-kct-noir dark:text-gray-100">{user?.nom}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-kct-red/10 hover:text-kct-red transition-colors"
                  title={t('layout.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <MaintenanceBanner />

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
