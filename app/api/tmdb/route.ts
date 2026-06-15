import { NextRequest, NextResponse } from 'next/server';
import { TMDB_BASE_URL } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const url = path.startsWith('http') ? path : `${TMDB_BASE_URL}${path}`;
  if (!url.startsWith(TMDB_BASE_URL)) {
    return NextResponse.json({ error: 'Invalid TMDB URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return NextResponse.json({ error: 'TMDB proxy failed' }, { status: 500 });
  }
}
