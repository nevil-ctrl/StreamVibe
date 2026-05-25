'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDB_BASE_URL, TMDB_IMAGE_URL, TMDB_ACCESS_TOKEN } from '@/lib/tmdb';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'release_date.asc', label: 'Oldest' },
];

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
};

export default function BrowsePage() {
  const params = useSearchParams();
  const genreId = params.get('genre') ?? '28';
  const genreName = params.get('name') ?? 'Movies';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const sortRef = useRef('popularity.desc');
  const pageRef = useRef(1);

  const fetchMovies = useCallback(
    async (p: number, s: string) => {
      setLoading(true);

      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=${s}&page=${p}&vote_count.gte=50`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
            },
          },
        );

        const data = await res.json();

        setMovies(data.results ?? []);
        setTotalPages(Math.min(data.total_pages ?? 1, 20));
      } finally {
        setLoading(false);
      }
    },
    [genreId],
  );

  // reset при смене жанра (без лишних циклов)
  useEffect(() => {
    const defaultSort = 'popularity.desc';

    sortRef.current = defaultSort;
    pageRef.current = 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSort(defaultSort);
    setPage(1);

    fetchMovies(1, defaultSort);
  }, [genreId, fetchMovies]);

  const handleSortChange = (newSort: string) => {
    sortRef.current = newSort;
    pageRef.current = 1;

    setSort(newSort);
    setPage(1);

    fetchMovies(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage));

    pageRef.current = clamped;
    setPage(clamped);

    fetchMovies(clamped, sortRef.current);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen px-10 md:px-[162px] py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-white">{genreName}</h1>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-[#1A1A1A] border border-[#262628] text-white text-sm rounded-lg px-4 py-2 outline-none cursor-pointer hover:border-white/30 transition-colors">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {loading
          ? Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-xl bg-[#1A1A1A] animate-pulse"
                style={{ aspectRatio: '2/3' }}
              />
            ))
          : movies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`}>
                <article
                  className="group relative rounded-xl overflow-hidden bg-[#1A1A1A] cursor-pointer"
                  style={{ aspectRatio: '2/3' }}>
                  {movie.poster_path && (
                    <Image
                      src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <p className="text-white font-medium text-sm leading-tight">
                        {movie.title}
                      </p>
                      <p className="text-[#E50000] text-xs mt-1">
                        ⭐ {movie.vote_average?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#262628] text-white text-sm disabled:opacity-40 hover:border-white/30 transition-colors">
            ← Prev
          </button>

          <span className="text-[#999999] text-sm px-4">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#262628] text-white text-sm disabled:opacity-40 hover:border-white/30 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
