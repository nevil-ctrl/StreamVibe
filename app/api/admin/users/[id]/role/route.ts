import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { role } = await req.json();

  if (id === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot change your own role' },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  return NextResponse.json({ success: true, user });
}
