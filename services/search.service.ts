import { fetchTMDB } from '@/services/tmdb';
import type { Movie, MovieResponse } from '@/types/movie';
import type { SearchMoviesParams } from '@/types/search';
import {
  DEFAULT_MOVIE_SORT,
  type MovieSortBy,
} from '@/lib/search-constants';

function sortMovies(movies: Movie[], sortBy: MovieSortBy): Movie[] {
  const sorted = [...movies];

  switch (sortBy) {
    case 'vote_average.desc':
      return sorted.sort((a, b) => b.vote_average - a.vote_average);
    case 'release_date.desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.release_date || 0).getTime() -
          new Date(a.release_date || 0).getTime(),
      );
    case 'release_date.asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.release_date || 0).getTime() -
          new Date(b.release_date || 0).getTime(),
      );
    case 'popularity.desc':
    default:
      return sorted;
  }
}

function filterByGenre(movies: Movie[], genreId?: number): Movie[] {
  if (!genreId) return movies;
  return movies.filter((m) => m.genre_ids?.includes(genreId));
}

/** Каталог TMDB: жанр + сортировка (без текстового запроса). */
export async function discoverMovies({
  genreId,
  sortBy = DEFAULT_MOVIE_SORT,
  page = 1,
}: {
  genreId?: number;
  sortBy?: MovieSortBy;
  page?: number;
}): Promise<MovieResponse> {
  const params = new URLSearchParams({
    sort_by: sortBy,
    page: String(page),
    'vote_count.gte': '50',
  });

  if (genreId) {
    params.set('with_genres', String(genreId));
  }

  return fetchTMDB<MovieResponse>(`/discover/movie?${params.toString()}`);
}

/** Поиск по названию через TMDB + опциональная фильтрация жанра и сортировка. */
export async function searchMoviesByTitle({
  query,
  genreId,
  sortBy = DEFAULT_MOVIE_SORT,
  page = 1,
}: {
  query: string;
  genreId?: number;
  sortBy?: MovieSortBy;
  page?: number;
}): Promise<MovieResponse> {
  const data = await fetchTMDB<MovieResponse>(
    `/search/movie?query=${encodeURIComponent(query.trim())}&page=${page}`,
  );

  let results = filterByGenre(data.results ?? [], genreId);
  results = sortMovies(results, sortBy);

  return {
    ...data,
    results,
    total_results: genreId ? results.length : data.total_results,
  };
}

/**
 * Единая точка входа для страницы поиска:
 * — есть запрос → /search/movie
 * — нет запроса → /discover/movie (жанр + сортировка на стороне TMDB)
 */
export async function searchMovies(
  params: SearchMoviesParams,
): Promise<MovieResponse> {
  const {
    query,
    genreId,
    sortBy = DEFAULT_MOVIE_SORT,
    page = 1,
  } = params;

  const trimmed = query?.trim();

  if (trimmed) {
    return searchMoviesByTitle({
      query: trimmed,
      genreId,
      sortBy,
      page,
    });
  }

  return discoverMovies({ genreId, sortBy, page });
}
