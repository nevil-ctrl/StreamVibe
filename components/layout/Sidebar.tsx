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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
        }`}>
        <Icon size={20} className="shrink-0" />
        {isOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-20'} h-screen bg-black border-r border-neutral-900 p-4 flex flex-col transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white mb-6 transition-colors">
        <LucideIcons.PanelLeftClose
          size={20}
          className={`shrink-0 transition-transform ${!isOpen ? 'rotate-180' : ''}`}
        />
        {isOpen && <span className="font-medium">Меню</span>}
      </button>

      <div className="flex-1 space-y-8">
        <nav className="space-y-1">
          {isOpen && (
            <p className="px-4 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
              Основное
            </p>
          )}
          {MAIN_MENU.map(renderLink)}
        </nav>

        <nav className="space-y-1">
          {isOpen && (
            <p className="px-4 text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-2">
              Аккаунт
            </p>
          )}
          {SETTINGS_MENU.map(renderLink)}
        </nav>
      </div>

      <div className="space-y-2 border-t border-neutral-900 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/20 w-full rounded-xl transition-colors">
          <LucideIcons.LogOut size={20} className="shrink-0" />
          {isOpen && <span className="font-medium">Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
