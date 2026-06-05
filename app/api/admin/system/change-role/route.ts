import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AdminAction } from '@prisma/client';
import { Role } from '@/types/role';

export async function PATCH(req: Request) {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session || (session.user.role as string) !== 'SUPERADMIN') {
    return NextResponse.json(
      { error: 'Only Superadmin can change roles' },
      { status: 403 },
    );
  }

  try {
    const { userId, newRole } = await req.json();

    if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as Role },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: AdminAction.SUB_MODIFY,
        targetId: userId,
        changes: { role: newRole },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 },
    );
  }
}
