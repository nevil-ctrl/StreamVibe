import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
  Film,
  Clock,
  Heart,
  ListPlus,
  Bell,
  CreditCard,
  ChevronRight,
  MessageSquare,
  Play,
  Star,
  Settings,
  Trophy,
} from 'lucide-react';
import { getUserWatchStats } from '@/services/watch-history.service';

function getBadges(
  stats: {
    totalWatched: number;
    completed: number;
    favorites: number;
    watchlist: number;
  },
  ticketsCount: number,
) {
  const badges = [];
  if (stats.totalWatched >= 1)
    badges.push({
      emoji: '🎬',
      label: 'Первый просмотр',
      desc: 'Посмотрел первый тайтл',
    });
  if (stats.completed >= 5)
    badges.push({
      emoji: '🔥',
      label: 'Марафонщик',
      desc: '5+ завершённых тайтлов',
    });
  if (stats.completed >= 20)
    badges.push({
      emoji: '🏆',
      label: 'Киноман',
      desc: '20+ завершённых тайтлов',
    });
  if (stats.favorites >= 10)
    badges.push({
      emoji: '❤️',
      label: 'Коллекционер',
      desc: '10+ в избранном',
    });
  if (stats.watchlist >= 5)
    badges.push({ emoji: '📋', label: 'Планировщик', desc: '5+ в списке' });
  if (ticketsCount >= 1)
    badges.push({
      emoji: '💬',
      label: 'Активный',
      desc: 'Первое обращение в поддержку',
    });
  return badges;
}

export default async function ProfileDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/login');

  const userEmail = session.user.email;

  // Run both DB queries in parallel to cut latency in half
  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        subscription: true,
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 4,
          select: {
            id: true,
            title: true,
            message: true,
            createdAt: true,
          },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { replies: { orderBy: { createdAt: 'desc' }, take: 1 } },
        },
      },
    }),
    // getUserWatchStats needs userId, but we can use session.user.id
    session.user.id
      ? getUserWatchStats(session.user.id)
      : Promise.resolve({ totalWatched: 0, favorites: 0, watchlist: 0, completed: 0, inProgress: 0 }),
  ]);

  if (!user) redirect('/auth/login');

  const displayName =
    user.name?.trim() || session.user.name?.trim() || user.email.split('@')[0];
  const avatarUrl = user.image || session.user.image;
  const unreadCount = user.notifications.length;
  const badges = getBadges(stats, user.tickets.length);

  const subPlanLabel: Record<string, string> = {
    BASIC: 'Базовый',
    STANDARD: 'Стандарт',
    PREMIUM: 'Премиум',
  };

  const ticketStatusLabel: Record<string, string> = {
    OPEN: 'Открыт',
    IN_PROGRESS: 'В работе',
    RESOLVED: 'Решён',
    CLOSED: 'Закрыт',
  };

  const ticketStatusColor: Record<string, string> = {
    OPEN: 'text-red-400 bg-red-500/10',
    IN_PROGRESS: 'text-yellow-400 bg-yellow-500/10',
    RESOLVED: 'text-green-400 bg-green-500/10',
    CLOSED: 'text-white/30 bg-white/5',
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#141414] border border-[#262628] p-7 md:p-9">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#E50000]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-[#E50000]/4 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <Link href="/user/settings" className="group relative flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#E50000] to-[#FF6666] flex items-center justify-center shadow-lg shadow-red-900/20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={72}
                  height={72}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {displayName[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <p className="text-[#999999] text-xs mb-0.5 uppercase tracking-widest">
              Добро пожаловать
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
              {displayName}
            </h1>
            <p className="text-[#999999] text-sm mt-1 truncate">{user.email}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Иконка колокольчика со счетчиком */}
            <Link
              href="/user/notifications"
              className="relative w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#262628] hover:border-[#E50000]/30 flex items-center justify-center transition-all">
              <Bell size={15} className="text-[#999999]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E50000] w-2 h-2 rounded-full" />
              )}
            </Link>

            {user.subscription ? (
              <Link href="/user/subscription">
                <div className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#E50000]/10 border border-[#E50000]/20 hover:bg-[#E50000]/15 transition-all">
                  <CreditCard size={15} className="text-[#E50000]" />
                  <div>
                    <p className="text-[#E50000] font-semibold text-xs leading-none">
                      {subPlanLabel[user.subscription.plan] ??
                        user.subscription.plan}
                    </p>
                    <p className="text-[#999999] text-[10px] mt-0.5">
                      до{' '}
                      {new Date(user.subscription.expiresAt).toLocaleDateString(
                        'ru-RU',
                        { day: 'numeric', month: 'short' },
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/user/subscription">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#262628] hover:border-[#E50000]/30 transition-all">
                  <Star size={14} className="text-[#999999]" />
                  <span className="text-[#999999] text-xs">Подписка</span>
                </div>
              </Link>
            )}

            <Link href="/user/settings">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#262628] hover:border-[#E50000]/30 flex items-center justify-center transition-all">
                <Settings size={15} className="text-[#999999]" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: 'Просмотрено',
            value: stats.totalWatched,
            icon: Film,
            href: '/user/watched',
            accent: 'text-blue-400',
            hover: 'hover:border-blue-500/30',
          },
          {
            title: 'Завершено',
            value: stats.completed,
            icon: Clock,
            href: '/user/history',
            accent: 'text-purple-400',
            hover: 'hover:border-purple-500/30',
          },
          {
            title: 'В избранном',
            value: stats.favorites,
            icon: Heart,
            href: '/user/favorites',
            accent: 'text-red-400',
            hover: 'hover:border-red-500/30',
          },
          {
            title: 'Мой список',
            value: stats.watchlist,
            icon: ListPlus,
            href: '/user/my-list',
            accent: 'text-emerald-400',
            hover: 'hover:border-emerald-500/30',
          },
        ].map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={`rounded-xl bg-[#141414] border border-[#262628] ${card.hover} p-5 transition-all`}>
              <card.icon
                size={18}
                className={`${card.accent} mb-3 opacity-80`}
              />
              <p className="text-white font-bold text-2xl leading-none">
                {card.value}
              </p>
              <p className="text-[#999999] text-xs mt-1">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Achievements */}
      {badges.length > 0 && (
        <div className="rounded-xl bg-[#141414] border border-[#262628] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#262628]">
            <Trophy size={15} className="text-[#999999]" />
            <span className="text-white font-semibold text-sm">Достижения</span>
            <span className="text-[#999999] text-xs bg-[#262628] px-2 py-0.5 rounded-full">
              {badges.length}
            </span>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                title={badge.desc}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#262628] hover:border-[#E50000]/20 transition-all cursor-default">
                <span className="text-lg leading-none">{badge.emoji}</span>
                <div>
                  <p className="text-white text-xs font-medium leading-none">
                    {badge.label}
                  </p>
                  <p className="text-[#999999] text-[10px] mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Блоки снизу (Уведомления + Обращения) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Уведомления */}
        <div className="rounded-xl bg-[#141414] border border-[#262628] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262628]">
            <div className="flex items-center gap-2.5">
              <Bell size={14} className="text-[#999999]" />
              <span className="text-white font-semibold text-sm">
                Уведомления
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#E50000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <Link
              href="/user/notifications"
              className="text-[#999999] text-xs hover:text-white transition-colors flex items-center gap-0.5">
              Все <ChevronRight size={11} />
            </Link>
          </div>

          <div className="divide-y divide-[#262628]/50">
            {user.notifications.length === 0 ? (
              <div className="px-5 py-7 text-center">
                <Bell size={22} className="text-[#262628] mx-auto mb-2" />
                <p className="text-[#999999] text-sm">Нет новых уведомлений</p>
              </div>
            ) : (
              user.notifications.map((n) => (
                <Link key={n.id} href="/user/notifications">
                  <div className="px-5 py-3.5 hover:bg-white/[0.015] transition-colors flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E50000] mt-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {n.title}
                      </p>
                      <p className="text-[#999999] text-xs truncate mt-0.5">
                        {n.message}
                      </p>
                    </div>
                    <p className="text-[#999999] text-[10px] flex-shrink-0 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Обращения */}
        <div className="rounded-xl bg-[#141414] border border-[#262628] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262628]">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={14} className="text-[#999999]" />
              <span className="text-white font-semibold text-sm">
                Обращения
              </span>
            </div>
            <Link
              href="/user/support"
              className="text-[#999999] text-xs hover:text-white transition-colors flex items-center gap-0.5">
              Все <ChevronRight size={11} />
            </Link>
          </div>

          <div className="divide-y divide-[#262628]/50">
            {user.tickets.length === 0 ? (
              <div className="px-5 py-7 text-center">
                <MessageSquare
                  size={22}
                  className="text-[#262628] mx-auto mb-2"
                />
                <p className="text-[#999999] text-sm">Нет обращений</p>
                <Link
                  href="/user/support"
                  className="inline-flex items-center gap-1.5 mt-2.5 text-[#E50000] text-xs hover:text-red-400 transition-colors">
                  <Play size={9} fill="currentColor" /> Создать обращение
                </Link>
              </div>
            ) : (
              user.tickets.map((ticket) => (
                <Link key={ticket.id} href="/user/support">
                  <div className="px-5 py-3.5 hover:bg-white/[0.015] transition-colors flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {ticket.message}
                      </p>
                      {ticket.replies[0] && (
                        <p className="text-[#999999] text-xs truncate mt-0.5">
                          Ответ: {ticket.replies[0].message}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${ticketStatusColor[ticket.status]}`}>
                      {ticketStatusLabel[ticket.status]}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
