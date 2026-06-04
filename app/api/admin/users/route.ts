import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
export async function GET(req: Request) {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const search = searchParams.get('search') ?? '';
  const filter = searchParams.get('filter') ?? 'all'; // all | banned | admin

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (filter === 'banned') where.isBanned = true;
  if (filter === 'admin') where.role = 'ADMIN';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true, expiresAt: true } },
        _count: { select: { watchHistory: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
}
