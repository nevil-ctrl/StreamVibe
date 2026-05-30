import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification, NotificationType } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

// POST /api/notifications/admin — отправить уведомление от имени системы/админа
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Проверяем что это ADMIN
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, type, title, message } = await req.json();

  if (!userId || !title || !message)
    return NextResponse.json(
      { error: 'userId, title, message required' },
      { status: 400 },
    );

  const notification = await createNotification({
    userId,
    type: (type as NotificationType) ?? 'ADMIN_MESSAGE',
    title,
    message,
  });

  return NextResponse.json({ notification });
}
