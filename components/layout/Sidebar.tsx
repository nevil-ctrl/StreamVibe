'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { signOut } from 'next-auth/react';

import { MAIN_MENU, SETTINGS_MENU } from '@/lib/constants';

type IconName = keyof typeof LucideIcons;

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const renderLink = (item: { name: string; icon: string; path: string }) => {
    const Icon = LucideIcons[item.icon as IconName] as LucideIcons.LucideIcon;
    const isActive = pathname === item.path;

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

  return (
    <aside
      className={`${isOpen ? 'w-56' : 'w-20'} h-full shrink-0 bg-black border-r border-neutral-900 p-4 flex flex-col transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white mb-2 transition-colors cursor-pointer rounded-xl hover:bg-neutral-900">
        <LucideIcons.PanelLeftClose
          size={20}
          className={`shrink-0 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}
        />
        {isOpen && <span className="font-medium">Меню</span>}
      </button>

      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 mb-4 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-xl transition-all duration-200 group">
        <LucideIcons.ArrowLeft
          size={18}
          className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200"
        />
        {isOpen && <span className="text-sm font-medium">На главную</span>}
      </Link>

      <div className="h-px bg-neutral-900 mb-4" />

      <div className="space-y-6 mb-6 flex-1">
        <nav className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
              Основное
            </p>
          )}
          {MAIN_MENU.map(renderLink)}
        </nav>

        <nav className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
              Аккаунт
            </p>
          )}
          {SETTINGS_MENU.map(renderLink)}
        </nav>
      </div>
      <div className="mt-auto border-t border-neutral-900 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 w-full rounded-xl transition-colors cursor-pointer">
          <LucideIcons.LogOut size={20} className="shrink-0" />
          {isOpen && <span className="font-medium">Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
