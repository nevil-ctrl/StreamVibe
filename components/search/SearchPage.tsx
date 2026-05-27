'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import MovieResultCard from '@/components/search/MovieResultCard';
import {
  DEFAULT_MOVIE_SORT,
  MOVIE_SORT_OPTIONS,
  type MovieSortBy,
} from '@/lib/search-constants';
import type { Movie, MovieResponse } from '@/types/movie';

type Genre = { id: number; name: string };

interface SearchPageProps {
  genres: Genre[];
}

const DEBOUNCE_MS = 400;

function buildSearchUrl(params: {
  q: string;
  genre: string;
  sort: MovieSortBy;
  page: number;
}) {
  const sp = new URLSearchParams();
  if (params.q.trim()) sp.set('q', params.q.trim());
  if (params.genre && params.genre !== 'all') sp.set('genre', params.genre);
  if (params.sort !== DEFAULT_MOVIE_SORT) sp.set('sort', params.sort);
  if (params.page > 1) sp.set('page', String(params.page));
  const qs = sp.toString();
  return qs ? `/search?${qs}` : '/search';
}

function readParams(searchParams: URLSearchParams) {
  return {
    q: searchParams.get('q') ?? '',
    genre: searchParams.get('genre') ?? 'all',
    sort: (searchParams.get('sort') as MovieSortBy) || DEFAULT_MOVIE_SORT,
    page: Math.max(1, Number(searchParams.get('page') ?? '1') || 1),
  };
}

export default function SearchPage({ genres }: SearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParams = readParams(searchParams);

  const [query, setQuery] = useState(urlParams.q);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { q, genre, sort, page } = urlParams;

  const pushUrl = useCallback(
    (next: { q: string; genre: string; sort: MovieSortBy; page: number }) => {
      router.replace(buildSearchUrl(next), { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          sort,
          page: String(page),
        });
        if (q.trim()) params.set('q', q.trim());
        if (genre && genre !== 'all') params.set('genre', genre);

        const res = await fetch(`/api/search/movies?${params.toString()}`);
        if (!res.ok) throw new Error('Search request failed');

        const data: MovieResponse = await res.json();
        if (cancelled) return;

        setMovies(data.results ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalResults(data.total_results ?? 0);
      } catch {
        if (cancelled) return;
        setMovies([]);
        setTotalPages(1);
        setTotalResults(0);
        setError('Не удалось загрузить результаты. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q, genre, sort, page]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushUrl({ q: value, genre, sort, page: 1 });
    }, DEBOUNCE_MS);
  };

  const handleGenreChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushUrl({ q: query, genre: value, sort, page: 1 });
  };

  const handleSortChange = (value: MovieSortBy) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushUrl({ q: query, genre, sort: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushUrl({ q: query, genre, sort, page: clamped });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushUrl({ q: query, genre, sort, page: 1 });
  };

  const hasQuery = q.trim().length > 0;
  const genreLabel =
    genre === 'all'
      ? 'все жанры'
      : (genres.find((g) => String(g.id) === genre)?.name ?? 'жанр');

  return (
    <div className="min-h-screen px-6 py-12 md:px-[162px] md:py-16">
      <div className="mb-10">
        <span className="mb-3 inline-block rounded-md bg-[#E50000] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          Поиск
        </span>
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          Найти фильм
        </h1>
        <p className="mt-2 max-w-2xl text-[#999999]">
          Поиск по каталогу TMDB — название, жанр и сортировка по рейтингу.
          {/* Ваша база хранит только фильмы, которые пользователи уже открывали. */}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Введите название фильма..."
            className="w-full rounded-xl border border-[#262628] bg-[#1A1A1A] py-4 pl-12 pr-4 text-white outline-none transition-colors placeholder:text-[#666666] focus:border-[#E50000]"
            autoFocus
          />
        </div>
      </form>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-hide flex flex-wrap gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleGenreChange('all')}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition-colors ${
              genre === 'all'
                ? 'border-[#E50000] bg-[#E50000]/10 text-white'
                : 'border-[#262628] bg-[#1A1A1A] text-[#BFBFBF] hover:border-white/30'
            }`}>
            Все жанры
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => handleGenreChange(String(g.id))}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition-colors ${
                genre === String(g.id)
                  ? 'border-[#E50000] bg-[#E50000]/10 text-white'
                  : 'border-[#262628] bg-[#1A1A1A] text-[#BFBFBF] hover:border-white/30'
              }`}>
              {g.name}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as MovieSortBy)}
          className="shrink-0 cursor-pointer rounded-lg border border-[#262628] bg-[#1A1A1A] px-4 py-2 text-sm text-white outline-none transition-colors hover:border-white/30">
          {MOVIE_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {!loading && !error && (
        <p className="mb-6 text-sm text-[#999999]">
          {hasQuery ? (
            <>
              Найдено: <span className="text-white">{totalResults}</span>
              {genre !== 'all' && (
                <>
                  {' '}
                  · жанр: <span className="text-white">{genreLabel}</span>
                </>
              )}
            </>
          ) : (
            <>
              Каталог TMDB
              {genre !== 'all' && (
                <>
                  {' '}
                  · <span className="text-white">{genreLabel}</span>
                </>
              )}
            </>
          )}
        </p>
      )}

      {error && (
        <div className="mb-8 rounded-xl border border-[#E50000]/40 bg-[#E50000]/10 px-4 py-3 text-sm text-[#FF9999]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-[#999999]">
          <Loader2 size={32} className="animate-spin text-[#E50000]" />
          <span>Загрузка...</span>
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-xl border border-[#262628] bg-[#1A1A1A] py-20 text-center">
          <p className="text-lg text-white">Ничего не найдено</p>
          <p className="mt-2 text-sm text-[#999999]">
            {hasQuery
              ? 'Попробуйте другое название или снимите фильтр жанра.'
              : 'Выберите жанр или введите название фильма.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieResultCard key={movie.id} movie={movie} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-[#262628] bg-[#1A1A1A] px-4 py-2 text-sm text-white transition-colors hover:border-white/30 disabled:opacity-40">
                ← Назад
              </button>
              <span className="px-4 text-sm text-[#999999]">
                Страница {page} из {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-[#262628] bg-[#1A1A1A] px-4 py-2 text-sm text-white transition-colors hover:border-white/30 disabled:opacity-40">
                Вперёд →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
