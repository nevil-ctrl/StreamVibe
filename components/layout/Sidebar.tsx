'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  BarChart2,
  PanelLeftClose,
  Film,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  X,
  History,
  Heart,
  ListPlus,
  CreditCard,
  LifeBuoy,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { MAIN_MENU, SETTINGS_MENU, ADMIN_MENU } from '@/lib/constants';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from '@/components/providers/LocaleProvider';
import type { MessageKey } from '@/lib/i18n/types';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  History,
  Film,
  Heart,
  ListPlus,
  CreditCard,
  Bell,
  LifeBuoy,
  Settings,
  Users,
  MessageSquare,
  BarChart2,
};

interface SidebarProps {
  variant?: 'user' | 'admin';
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);
  return isMobile;
}

export default function Sidebar({ variant = 'user' }: SidebarProps) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const t = useTranslations();

  const isOpen = isMobile ? mobileOpen : !desktopCollapsed;
  const currentRole = session?.user?.role as string;
  const hasAdminAccess =
    currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';
  const isAdmin = variant === 'admin';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const iconBtn = (active: boolean) =>
    `flex items-center rounded-xl font-medium transition-all duration-200 ${
      isOpen
        ? 'gap-3 px-3 py-2.5 w-full min-h-[44px]'
        : 'w-10 h-10 justify-center mx-auto'
    } ${
      active
        ? 'bg-[#E50000] text-white shadow-lg shadow-red-900/20'
        : 'text-[#999999] hover:bg-[#1A1A1A] hover:text-white'
    }`;

  const renderLink = (item: {
    nameKey: MessageKey;
    icon: LucideIcon;
    path: string;
  }) => {
    const Icon = item.icon;
    const label = t(item.nameKey);
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => isMobile && setMobileOpen(false)}
        title={!isOpen ? label : ''}
        className={iconBtn(isActive)}>
        <Icon size={19} className="shrink-0" />
        {isOpen && <span className="text-[14px]">{label}</span>}
      </Link>
    );
  };

  const renderUserLink = (item: {
    nameKey: MessageKey;
    icon: string;
    path: string;
  }) => {
    const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
    const label = t(item.nameKey);
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => isMobile && setMobileOpen(false)}
        title={!isOpen ? label : ''}
        className={iconBtn(isActive)}>
        <Icon size={19} className="shrink-0" />
        {isOpen && <span className="text-[14px]">{label}</span>}
      </Link>
    );
  };

  const adminMenuItems = ADMIN_MENU.map((item) => ({
    ...item,
    icon: ICON_MAP[item.icon] ?? LayoutDashboard,
  }));

  const neutralBtn = `flex items-center rounded-xl transition-all duration-200 text-[#999999] hover:bg-[#1A1A1A] hover:text-white ${
    isOpen
      ? 'gap-3 px-3 py-2.5 w-full min-h-[44px]'
      : 'w-10 h-10 justify-center mx-auto'
  }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-[#262628] bg-[#1A1A1A] text-white shadow-lg hover:bg-[#262628] transition"
        aria-label={t('nav.openMenu')}>
        <PanelLeftClose size={20} className="rotate-180" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          h-full shrink-0 bg-[#0A0A0A] border-r border-[#1A1A1A] p-4 flex flex-col
          transition-all duration-300 ease-in-out
          w-[min(260px,82vw)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-[72px]' : 'lg:w-56'}
        `}>
        {/* Desktop toggle */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className={`${neutralBtn} mb-2 cursor-pointer`}>
            <PanelLeftClose
              size={20}
              className={`shrink-0 transition-transform duration-300 ${desktopCollapsed ? 'rotate-180' : ''}`}
            />
            {isOpen && (
              <span className="font-medium text-[14px]">
                {t('sidebar.menu')}
              </span>
            )}
          </button>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-white text-[15px]">
              {t('sidebar.menu')}
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262628] bg-[#1A1A1A] text-white hover:bg-[#262628] transition"
              aria-label={t('nav.closeMenu')}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* Admin badge */}
        {isAdmin &&
          (isOpen ? (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
              <Film className="text-[#E50000] shrink-0" size={18} />
              <span className="text-white font-bold text-[14px]">
                StreamVibe
              </span>
              <span className="text-[10px] bg-[#E50000]/20 text-[#E50000] px-2 py-0.5 rounded-full ml-auto">
                {t('sidebar.admin')}
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-3 mb-2">
              <Film className="text-[#E50000]" size={18} />
            </div>
          ))}

        {/* Back to home */}
        {!isAdmin && (
          <Link
            href="/"
            onClick={() => isMobile && setMobileOpen(false)}
            className={`${neutralBtn} mb-3 group`}>
            <ArrowLeft
              size={17}
              className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            {isOpen && (
              <span className="text-[14px] font-medium">
                {t('sidebar.backToHome')}
              </span>
            )}
          </Link>
        )}

        <div className="h-px bg-[#262628] mb-3" />

        {/* Nav */}
        <div className="space-y-5 mb-4 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {isAdmin ? (
            <nav className="space-y-0.5">
              {isOpen && (
                <p className="px-3 text-[10px] uppercase tracking-widest text-[#555] font-bold mb-2">
                  {t('sidebar.management')}
                </p>
              )}
              {adminMenuItems.map(renderLink)}
            </nav>
          ) : (
            <>
              <nav className="space-y-0.5">
                {isOpen && (
                  <p className="px-3 text-[10px] uppercase tracking-widest text-[#555] font-bold mb-2">
                    {t('sidebar.main')}
                  </p>
                )}
                {MAIN_MENU.map(renderUserLink)}
              </nav>

              <nav className="space-y-0.5">
                {isOpen && (
                  <p className="px-3 text-[10px] uppercase tracking-widest text-[#555] font-bold mb-2">
                    {t('sidebar.account')}
                  </p>
                )}
                {SETTINGS_MENU.map(renderUserLink)}
              </nav>

              {hasAdminAccess && (
                <div className={isOpen ? 'px-0' : 'flex justify-center'}>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => isMobile && setMobileOpen(false)}
                    title={!isOpen ? t('sidebar.adminPanel') : ''}
                    className={`flex items-center rounded-xl border transition-all duration-200 text-amber-400/80 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20 group ${
                      isOpen
                        ? 'gap-3 px-3 py-2.5 w-full min-h-[44px]'
                        : 'w-10 h-10 justify-center'
                    }`}>
                    <ShieldCheck
                      size={18}
                      className="shrink-0 transition-transform group-hover:scale-105"
                    />
                    {isOpen && (
                      <span className="text-[14px] font-medium tracking-wide">
                        {t('sidebar.adminPanel')}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Admin footer */}
        {isAdmin && (
          <div className="border-t border-[#262628] pt-2 mb-2 space-y-0.5">
            <Link
              href="https://us.posthog.com/project/454133/dashboard/1668637"
              target="_blank"
              className={`${neutralBtn} text-xs`}>
              <BarChart2 size={14} className="shrink-0" />
              {isOpen && <span>PostHog Analytics</span>}
            </Link>
            <Link
              href="/"
              onClick={() => isMobile && setMobileOpen(false)}
              className={neutralBtn}>
              <ArrowLeft size={17} className="shrink-0" />
              {isOpen && (
                <span className="text-[14px] font-medium">
                  {t('sidebar.backToSite')}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-auto border-t border-[#262628] pt-3 space-y-1">
          {isOpen && (
            <div className="px-1 mb-1">
              <LanguageSwitcher className="w-full justify-center" />
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              signOut({ callbackUrl: isAdmin ? '/' : '/auth/login' })
            }
            className={`flex items-center rounded-xl transition-colors cursor-pointer text-[#E50000] hover:bg-[#E50000]/10 ${
              isOpen
                ? 'gap-3 px-3 py-2.5 w-full min-h-[44px]'
                : 'w-10 h-10 justify-center mx-auto'
            }`}>
            <LogOut size={19} className="shrink-0" />
            {isOpen && (
              <span className="text-[14px] font-medium">
                {t('sidebar.logout')}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
