import { NextResponse } from 'next/server';
import { getShowDetail } from '@/services/media-detail.service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const show = await getShowDetail(Number(id)).catch(() => null);
  if (!show) return NextResponse.json({}, { status: 404 });
  return NextResponse.json({
    number_of_seasons: show.number_of_seasons,
  });
}
