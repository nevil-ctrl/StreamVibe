import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AdminAction } from '@prisma/client';

// Определяем тип для params как Promise
type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  const { id } = await params; // ВАЖНО: await params
  const session = await auth();
  const role = session?.user?.role as string;

  if (!session || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reason, expiresAt } = await req.json();

  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (role === 'ADMIN' && targetUser.role !== 'USER') {
    return NextResponse.json(
      { error: 'Admins can only ban regular users' },
      { status: 403 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isBanned: true,
      bannedAt: new Date(),
      banReason: reason ?? 'Нарушение правил',
      banExpiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: AdminAction.USER_BAN,
      targetId: id,
      changes: {
        reason: reason ?? 'Нарушение правил',
        expiresAt: expiresAt ?? null,
      },
    },
  });

  return NextResponse.json({ success: true, user });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { id } = await params; // ВАЖНО: await params
  const session = await auth();
  const role = session?.user?.role as string;

  if (!session || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (role === 'ADMIN' && targetUser.role !== 'USER') {
    return NextResponse.json(
      { error: 'Admins can only unban regular users' },
      { status: 403 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isBanned: false,
      bannedAt: null,
      banReason: null,
      banExpiresAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: AdminAction.USER_UNBAN,
      targetId: id,
    },
  });

  return NextResponse.json({ success: true, user });
}
