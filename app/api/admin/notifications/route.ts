import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';
  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, message, type, target } = await req.json();
  // target: 'all' | 'premium' | 'basic' | 'standard'

  if (!title || !message) {
    return NextResponse.json(
      { error: 'title and message required' },
      { status: 400 },
    );
  }

  let userIds: string[];

  if (target === 'all') {
    const users = await prisma.user.findMany({ select: { id: true } });
    userIds = users.map((u) => u.id);
  } else {
    const subs = await prisma.subscription.findMany({
      where: { plan: target.toUpperCase(), status: 'ACTIVE' },
      select: { userId: true },
    });
    userIds = subs.map((s) => s.userId);
  }

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: type ?? 'ADMIN_BROADCAST',
      title,
      message,
    })),
  });

  return NextResponse.json({ success: true, sent: userIds.length });
}

export async function GET() {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Последние рассылки (уникальные по title+message)
  const recent = await prisma.notification.findMany({
    where: { type: 'ADMIN_BROADCAST' },
    distinct: ['title'],
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, title: true, message: true, createdAt: true },
  });

  return NextResponse.json({ recent });
}
