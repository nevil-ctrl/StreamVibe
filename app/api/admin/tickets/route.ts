import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, TicketStatus } from '@prisma/client';

export async function GET(req: Request) {
  const session = await auth();
  if (
    !session ||
    !['ADMIN', 'SUPERADMIN'].includes(
      String(session?.user?.role || '').toUpperCase(),
    )
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const status = searchParams.get('status') ?? 'all';
  const dateFrom = searchParams.get('dateFrom'); // формат 2026-06-04
  const dateTo = searchParams.get('dateTo');

  const where: Prisma.SupportTicketWhereInput = {
    ...(status !== 'all' && { status: status as TicketStatus }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && {
          lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
        }),
      },
    }),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip: (page - 1) * 20,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return NextResponse.json({ tickets, total, pages: Math.ceil(total / 20) });
}
