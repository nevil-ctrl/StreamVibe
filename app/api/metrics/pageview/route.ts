import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { path } = await req.json();

    const pageView = await prisma.pageView.create({
      data: {
        path,
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, id: pageView.id });
  } catch {
    return NextResponse.json(
      { error: 'Failed to log pageview' },
      { status: 500 },
    );
  }
}
