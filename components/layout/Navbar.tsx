'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/constants';
import {
  Search,
  Bell,
  User,
  CheckCheck,
  Trash2,
  CreditCard,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'PAYMENT_SUCCESS')
    return (
      <div className="w-8 h-8 rounded-full bg-green-400/10 text-green-400 flex items-center justify-center shrink-0">
        <CreditCard size={14} />
      </div>
    );
  if (type === 'PAYMENT_FAILED')
    return (
      <div className="w-8 h-8 rounded-full bg-red-400/10 text-red-400 flex items-center justify-center shrink-0">
        <AlertCircle size={14} />
      </div>
    );
  if (type === 'SUBSCRIPTION_CANCELLED')
    return (
      <div className="w-8 h-8 rounded-full bg-[#999]/10 text-[#999] flex items-center justify-center shrink-0">
        <XCircle size={14} />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-[#E50000]/10 text-[#E50000] flex items-center justify-center shrink-0">
      <Bell size={14} />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} д назад`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleMarkAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      {/* ── Кнопка колокольчика ── */}
      <button
        onClick={handleOpen}
        className="relative cursor-pointer flex items-center justify-center w-7 h-7"
        aria-label="Уведомления">
        <Bell
          size={24}
          className={`transition hover:scale-110 ${open ? 'text-[#E50000]' : 'text-white'}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#E50000] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Дропдаун ── */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F]">
            <span className="text-white font-semibold text-sm">
              Уведомления
            </span>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors cursor-pointer">
                <CheckCheck size={13} />
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 border-2 border-[#E50000] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-[#333] mx-auto mb-2" />
                <p className="text-[#666] text-sm">Уведомлений нет</p>
              </div>
            ) : (
              notifications.map((notif, i) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 group transition-colors hover:bg-[#1A1A1A] ${
                    !notif.isRead ? 'bg-[#141414]' : ''
                  } ${i !== notifications.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
                  <NotifIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-tight ${notif.isRead ? 'text-[#999]' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-red-400 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-[#666] text-xs mt-0.5 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[#444] text-xs mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E50000] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[#1F1F1F]">
              <Link
                href="/user/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-[#666] hover:text-white transition-colors">
                Все уведомления →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between">
      <Link href="/">
        <Image src="/logo/Logo.svg" alt="StreamVibe" width={200} height={60} />
      </Link>

      <div className="flex items-center rounded-[14px] border border-[#262626] bg-[#0F0F0F]/90 p-2.5 backdrop-blur-xl">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-[9px] px-6 py-4 text-[16px] font-medium transition ${
              pathname === href
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#BFBFBF] hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/search"
          className="cursor-pointer flex items-center justify-center w-7 h-7"
          aria-label="Поиск">
          <Search size={24} className="text-white transition hover:scale-110" />
        </Link>

        {session?.user ? (
          <NotificationBell />
        ) : (
          <div className="flex items-center justify-center w-7 h-7">
            <Bell size={24} className="text-white/30" />
          </div>
        )}

        {status === 'loading' ? (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent border-(--red-45)" />
        ) : session ? (
          <Link
            href="/user/profile"
            className="relative h-11 w-11 flex items-center justify-center rounded-full border border-[#262626] bg-[#1A1A1A] hover:border-(--red-45) transition overflow-hidden">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <User size={22} className="text-white" />
            )}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-lg bg-(--red-45) hover:bg-(--red-50) text-white text-sm font-medium px-5 py-2.5 transition duration-200">
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
}
