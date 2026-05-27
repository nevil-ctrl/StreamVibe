import { searchMovies } from '@/services/search.service';
import {
  DEFAULT_MOVIE_SORT,
  MOVIE_SORT_OPTIONS,
  type MovieSortBy,
} from '@/lib/search-constants';

export const dynamic = 'force-dynamic';

const VALID_SORT = new Set<string>(
  MOVIE_SORT_OPTIONS.map((o) => o.value),
);

function parseSort(value: string | null): MovieSortBy {
  if (value && VALID_SORT.has(value)) {
    return value as MovieSortBy;
  }
  return DEFAULT_MOVIE_SORT;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q') ?? undefined;
  const genreRaw = searchParams.get('genre');
  const sortBy = parseSort(searchParams.get('sort'));
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const genreId =
    genreRaw && genreRaw !== 'all' ? Number(genreRaw) : undefined;

  if (genreId !== undefined && Number.isNaN(genreId)) {
    return Response.json({ error: 'Invalid genre' }, { status: 400 });
  }

  try {
    const data = await searchMovies({ query, genreId, sortBy, page });
    const totalPages = Math.min(data.total_pages ?? 1, 20);

    return Response.json({
      ...data,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error('[search/movies]', error);
    return Response.json(
      { error: 'Не удалось выполнить поиск' },
      { status: 500 },
    );
  }
}
