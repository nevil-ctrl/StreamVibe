import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { canRecordPageView } from '@/lib/consent/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!(await canRecordPageView())) {
      return NextResponse.json({ success: true, skipped: true });
    }

    let path = '/';
    try {
      const body = await req.json();
      path = body.path || '/';
    } catch {
      // ignore
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    Promise.resolve().then(() => {
      prisma.pageView.create({
        data: {
          path,
          userId,
        },
      }).catch(console.error);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Pageview log error:', err);
    return NextResponse.json(
      { error: 'Failed to log pageview' },
      { status: 500 },
    );
  }
}
