import { getSeasonEpisodes } from '@/services/media-detail.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string; seasonNumber: string }> },
) {
  const { id, seasonNumber } = await context.params;
  const showId = Number(id);
  const season = Number(seasonNumber);

  if (Number.isNaN(showId) || Number.isNaN(season)) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const data = await getSeasonEpisodes(showId, season);
    return Response.json(data);
  } catch {
    return Response.json(
      { error: 'Failed to load season' },
      { status: 500 },
    );
  }
}
