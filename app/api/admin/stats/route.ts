import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  const currentRole = String(session?.user?.role || '').toUpperCase();
  const hasAccess = currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    bannedUsers,
    totalPayments,
    revenueThisMonth,
    revenueLastMonth,
    activeSubscriptions,
    totalWatched,
    openTickets,
    pageViewsThisMonth,
    pageViewsLastMonth,
    recentUsers,
    recentViews,
    recentPayments,
    topMovies,
    topShows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfMonth }, status: 'SUCCESS' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        status: 'SUCCESS',
      },
    }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.watchHistory.count(),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.pageView.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.pageView.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    }),
    prisma.user.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.pageView.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: 'SUCCESS',
      },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.watchHistory.groupBy({
      by: ['movieId'],
      where: { movieId: { not: null } },
      _count: { movieId: true },
      orderBy: { _count: { movieId: 'desc' } },
      take: 5,
    }),
    prisma.watchHistory.groupBy({
      by: ['showId'],
      where: { showId: { not: null } },
      _count: { showId: true },
      orderBy: { _count: { showId: 'desc' } },
      take: 5,
    }),
  ]);

  function groupByDay(items: { createdAt: Date }[]) {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const day = item.createdAt.toISOString().split('T')[0];
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }

  function groupPaymentsByDay(items: { createdAt: Date; amount: number }[]) {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const day = item.createdAt.toISOString().split('T')[0];
      map[day] = (map[day] || 0) + item.amount;
    });
    return Object.entries(map).map(([date, amount]) => ({
      date,
      amount: amount / 100,
    }));
  }

  const topMovieIds = topMovies
    .map((m) => m.movieId)
    .filter(Boolean) as string[];
  const topShowIds = topShows.map((s) => s.showId).filter(Boolean) as string[];

  const [moviesData, showsData] = await Promise.all([
    prisma.movie.findMany({
      where: { id: { in: topMovieIds } },
      select: { id: true, title: true },
    }),
    prisma.show.findMany({
      where: { id: { in: topShowIds } },
      select: { id: true, name: true },
    }),
  ]);

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);

  return NextResponse.json({
    stats: {
      totalUsers,
      newUsersThisMonth,
      usersGrowth: pctChange(newUsersThisMonth, newUsersLastMonth),
      bannedUsers,
      totalRevenue: (totalPayments._sum.amount ?? 0) / 100,
      revenueThisMonth: (revenueThisMonth._sum.amount ?? 0) / 100,
      revenueGrowth: pctChange(
        revenueThisMonth._sum.amount ?? 0,
        revenueLastMonth._sum.amount ?? 0,
      ),
      activeSubscriptions,
      totalWatched,
      openTickets,
      pageViewsThisMonth,
      viewsGrowth: pctChange(pageViewsThisMonth, pageViewsLastMonth),
    },

    charts: {
      userRegistrations: groupByDay(recentUsers),
      pageViews: groupByDay(recentViews),
      revenue: groupPaymentsByDay(recentPayments),
    },

    top: {
      movies: topMovies.map((m) => ({
        id: m.movieId,
        count: m._count.movieId,
        title: moviesData.find((d) => d.id === m.movieId)?.title ?? m.movieId,
      })),

      shows: topShows.map((s) => ({
        id: s.showId,
        count: s._count.showId,
        name: showsData.find((d) => d.id === s.showId)?.name ?? s.showId,
      })),
    },
  });
}
