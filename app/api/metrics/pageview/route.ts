import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canRecordPageView } from '@/lib/consent/server';

export async function POST(req: Request) {
  try {
    if (!(await canRecordPageView())) {
      return NextResponse.json({ success: true, skipped: true });
    }

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
