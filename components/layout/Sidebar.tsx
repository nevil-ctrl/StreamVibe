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
  Menu,
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
import { MAIN_MENU, SETTINGS_MENU } from '@/lib/constants';

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

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
};

const ADMIN_MENU: MenuItem[] = [
  { name: 'Дашборд', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Пользователи', icon: Users, path: '/admin/users' },
  { name: 'Тикеты', icon: MessageSquare, path: '/admin/tickets' },
  { name: 'Рассылки', icon: Bell, path: '/admin/notifications' },
  { name: 'Аналитика', icon: BarChart2, path: '/admin/analytics' },
];

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

  const renderLink = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => isMobile && setMobileOpen(false)}
        title={!isOpen ? item.name : ''}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] ${
          isActive
            ? 'bg-[#E50000] text-white shadow-lg shadow-red-900/20'
            : 'text-[#999999] hover:bg-[#1A1A1A] hover:text-white'
        }`}>
        <Icon size={20} className="w-5 h-5 shrink-0" />
        {isOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  const renderUserLink = (item: {
    name: string;
    icon: string;
    path: string;
  }) => {
    const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => isMobile && setMobileOpen(false)}
        title={!isOpen ? item.name : ''}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] ${
          isActive
            ? 'bg-[#E50000] text-white shadow-lg shadow-red-900/20'
            : 'text-[#999999] hover:bg-[#1A1A1A] hover:text-white'
        }`}>
        <Icon size={20} className="w-5 h-5 shrink-0" />
        {isOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {!isMobile && (
        <button
          type="button"
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="flex items-center gap-3 px-4 py-3 text-[#999999] hover:text-white mb-2 transition-colors cursor-pointer rounded-xl hover:bg-[#1A1A1A] min-h-[44px]">
          <PanelLeftClose
            size={20}
            className={`shrink-0 transition-transform duration-300 ${
              desktopCollapsed ? 'rotate-180' : ''
            }`}
          />
          {isOpen && <span className="font-medium">Меню</span>}
        </button>
      )}

      {isMobile && (
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="font-semibold text-white">Меню</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262628] bg-[#1A1A1A] text-white"
            aria-label="Закрыть меню">
            <X size={18} />
          </button>
        </div>
      )}

      {isAdmin &&
        (isOpen ? (
          <div className="flex items-center gap-2 px-4 py-3 mb-2">
            <Film className="text-[#E50000] shrink-0" size={20} />
            <span className="text-white font-bold">StreamVibe</span>
            <span className="text-xs bg-[#E50000]/20 text-[#E50000] px-2 py-0.5 rounded-full ml-auto">
              Admin
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-3 mb-2">
            <Film className="text-[#E50000]" size={20} />
          </div>
        ))}

      {!isAdmin && (
        <Link
          href="/"
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 mb-4 text-[#999999] hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-all duration-200 group min-h-[44px]">
          <ArrowLeft
            size={18}
            className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200"
          />
          {isOpen && <span className="text-sm font-medium">На главную</span>}
        </Link>
      )}

      <div className="h-px bg-[#262628] mb-4" />

      <div className="space-y-6 mb-6 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        {isAdmin ? (
          <nav className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] uppercase tracking-widest text-[#666666] font-bold mb-2">
                Управление
              </p>
            )}
            {ADMIN_MENU.map(renderLink)}
          </nav>
        ) : (
          <>
            <nav className="space-y-1">
              {isOpen && (
                <p className="px-3 text-[10px] uppercase tracking-widest text-[#666666] font-bold mb-2">
                  Основное
                </p>
              )}
              {MAIN_MENU.map(renderUserLink)}
            </nav>

            <nav className="space-y-1">
              {isOpen && (
                <p className="px-3 text-[10px] uppercase tracking-widest text-[#666666] font-bold mb-2">
                  Аккаунт
                </p>
              )}
              {SETTINGS_MENU.map(renderUserLink)}
            </nav>

            {hasAdminAccess && (
              <div className="pt-2 px-2">
                <Link
                  href="/admin/dashboard"
                  onClick={() => isMobile && setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-amber-400/80 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 w-full rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-all duration-200 group min-h-[44px]">
                  <ShieldCheck
                    size={18}
                    className="shrink-0 transition-transform group-hover:scale-105"
                  />
                  {isOpen && (
                    <span className="text-sm font-medium tracking-wide">
                      Панель управления
                    </span>
                  )}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <div className="border-t border-[#262628] pt-2 mb-2">
          <Link
            href="https://us.posthog.com/project/454133/dashboard/1668637"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#666666] hover:text-white hover:bg-[#1A1A1A] transition-all text-xs min-h-[44px]">
            <BarChart2 size={14} className="shrink-0" />
            {isOpen && <span>PostHog Analytics</span>}
          </Link>
          <Link
            href="/"
            onClick={() => isMobile && setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#999999] hover:text-white hover:bg-[#1A1A1A] transition-all min-h-[44px]">
            <ArrowLeft size={18} className="shrink-0" />
            {isOpen && <span className="text-sm font-medium">На сайт</span>}
          </Link>
        </div>
      )}

      <div className="mt-auto border-t border-[#262628] pt-4">
        <button
          type="button"
          onClick={() =>
            signOut({ callbackUrl: isAdmin ? '/' : '/auth/login' })
          }
          className="flex items-center gap-3 px-4 py-3 text-[#E50000] hover:bg-[#E50000]/10 w-full rounded-xl transition-colors cursor-pointer min-h-[44px]">
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="font-medium">Выйти</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-lg border border-[#262628] bg-[#1A1A1A] text-white shadow-lg"
        aria-label="Открыть меню">
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          h-full shrink-0 bg-black border-r border-[#262628] p-4 flex flex-col
          transition-transform duration-300 ease-in-out
          w-[min(280px,85vw)] lg:w-56
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-20' : 'lg:w-56'}
        `}>
        {sidebarContent}
      </aside>
    </>
  );
}
