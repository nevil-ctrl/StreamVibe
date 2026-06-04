'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  BarChart2,
  Film,
  Settings,
  LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const nav = [
  { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/tickets', label: 'Тикеты', icon: MessageSquare },
  { href: '/admin/notifications', label: 'Рассылки', icon: Bell },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Film className="text-red-500" size={24} />
          <span className="text-white font-bold text-lg">StreamVibe</span>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-red-500/20 text-red-400 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}

      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="https://us.posthog.com/project/454133/dashboard/1668637"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs">
          <BarChart2 size={14} />
          PostHog Analytics
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={18} />
          На сайт
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
