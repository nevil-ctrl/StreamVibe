import { fetchTMDB } from '@/services/tmdb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return Response.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      query,
      page: '1',
    });

    const data = await fetchTMDB<{ results: Array<{ id: number; title: string }>}>(
      `/search/movie?${params.toString()}`,
    );

    const suggestions = (data.results ?? [])
      .slice(0, 8)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
      }));

    return Response.json({ results: suggestions });
  } catch (error) {
    console.error('[search/suggestions]', error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
