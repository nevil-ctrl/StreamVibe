import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
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
      // ignore invalid JSON body
    }

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });
    const userId = (token?.id as string | undefined) ?? token?.sub ?? null;

    void prisma.pageView
      .create({
        data: {
          path,
          userId,
        },
      })
      .catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Pageview log error:', err);
    return NextResponse.json(
      { error: 'Failed to log pageview' },
      { status: 500 },
    );
  }
}
