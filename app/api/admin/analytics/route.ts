import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalViews,
      totalTickets,
      activeSubs,
      revenueData,
      viewsByDay,
      recentTickets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.watchHistory.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),

      prisma.payment.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'asc' },
      }),

      prisma.pageView.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),

      prisma.supportTicket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const chartData = viewsByDay.map((item, index) => {
      const date = new Date(item.createdAt).toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric',
      });
      return {
        name: date,
        просмотры: item._count.id,
        доход: revenueData[index]?._sum.amount || 0,
      };
    });

    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0,
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalViews,
        activeSubs,
        openTickets: totalTickets,
        totalRevenue,
      },
      chartData:
        chartData.length > 0
          ? chartData
          : [{ name: 'Нет данных', просмотры: 0, доход: 0 }],
      recentTickets,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
