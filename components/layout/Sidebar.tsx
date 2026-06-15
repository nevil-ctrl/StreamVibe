'use client';

import { useState } from 'react';
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
  type LucideIcon,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { MAIN_MENU, SETTINGS_MENU } from '@/lib/constants';

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

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

export default function Sidebar({ variant = 'user' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  const currentRole = session?.user?.role as string;
  const hasAdminAccess =
    currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';
  const isAdmin = variant === 'admin';

  const renderLink = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        title={!isOpen ? item.name : ''}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
        }`}>
        <Icon size={20} className="w-5 h-5 shrink-0" />
        {isOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  // MAIN_MENU и SETTINGS_MENU тоже нужно привести к MenuItem[]
  // если у них icon — строка, конвертируем динамически только для них
  const renderLegacyLink = (item: {
    name: string;
    icon: string;
    path: string;
  }) => {
    // fallback для старых меню со строковыми иконками
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + '/');
    return (
      <Link
        key={item.path}
        href={item.path}
        title={!isOpen ? item.name : ''}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
        }`}>
        {isOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-56' : 'w-20'
      } h-full shrink-0 bg-black border-r border-neutral-900 p-4 flex flex-col transition-all duration-300`}>
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white mb-2 transition-colors cursor-pointer rounded-xl hover:bg-neutral-900">
        <PanelLeftClose
          size={20}
          className={`shrink-0 transition-transform duration-300 ${
            !isOpen ? 'rotate-180' : ''
          }`}
        />
        {isOpen && <span className="font-medium">Меню</span>}
      </button>

      {/* Логотип — только в админке */}
      {isAdmin &&
        (isOpen ? (
          <div className="flex items-center gap-2 px-4 py-3 mb-2">
            <Film className="text-red-500 shrink-0" size={20} />
            <span className="text-white font-bold">StreamVibe</span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">
              Admin
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-3 mb-2">
            <Film className="text-red-500" size={20} />
          </div>
        ))}

      {/* Назад — только в user */}
      {!isAdmin && (
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 mb-4 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-xl transition-all duration-200 group">
          <ArrowLeft
            size={18}
            className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200"
          />
          {isOpen && <span className="text-sm font-medium">На главную</span>}
        </Link>
      )}

      <div className="h-px bg-neutral-900 mb-4" />

      <div className="space-y-6 mb-6 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        {isAdmin ? (
          <nav className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
                Управление
              </p>
            )}
            {ADMIN_MENU.map(renderLink)}
          </nav>
        ) : (
          <>
            <nav className="space-y-1">
              {isOpen && (
                <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
                  Основное
                </p>
              )}
              {MAIN_MENU.map(renderLegacyLink)}
            </nav>

            <nav className="space-y-1">
              {isOpen && (
                <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
                  Аккаунт
                </p>
              )}
              {SETTINGS_MENU.map(renderLegacyLink)}
            </nav>

            {hasAdminAccess && (
              <div className="pt-2 px-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 text-amber-400/80 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 w-full rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-all duration-200 group">
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

      {/* PostHog — только в админке */}
      {isAdmin && (
        <div className="border-t border-neutral-900 pt-2 mb-2">
          <Link
            href="https://us.posthog.com/project/454133/dashboard/1668637"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:text-white hover:bg-neutral-900 transition-all text-xs">
            <BarChart2 size={14} className="shrink-0" />
            {isOpen && <span>PostHog Analytics</span>}
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all">
            <ArrowLeft size={18} className="shrink-0" />
            {isOpen && <span className="text-sm font-medium">На сайт</span>}
          </Link>
        </div>
      )}

      <div className="mt-auto border-t border-neutral-900 pt-4">
        <button
          onClick={() =>
            signOut({ callbackUrl: isAdmin ? '/' : '/auth/login' })
          }
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 w-full rounded-xl transition-colors cursor-pointer">
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="font-medium">Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
