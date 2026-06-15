'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Star,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TMDB_IMAGE_URL, TMDB_BASE_URL } from '@/lib/tmdb';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
}

const STATUS_MAP: Record<string, string> = {
  genres_movie: `/movie/popular`,
  top10_movie: `/movie/top_rated`,
  trending_movie: `/trending/movie/week`,
  new_movie: `/movie/upcoming`,
  must_movie: `/movie/now_playing`,
  genres_tv: `/tv/popular`,
  top10_tv: `/tv/top_rated`,
  trending_tv: `/trending/tv/week`,
  new_tv: `/tv/airing_today`,
  must_tv: `/tv/on_the_air`,
  trending: `/trending/movie/week`,
  popular: `/movie/popular`,
  top_rated: `/movie/top_rated`,
  now_playing: `/movie/now_playing`,
  upcoming: `/movie/upcoming`,
  airing_today: `/tv/airing_today`,
  on_the_air: `/tv/on_the_air`,
};

export default function GenrePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-12 min-h-screen text-[#999]">Загрузка...</div>
      }>
      <GenrePageContent />
    </Suspense>
  );
}

function GenrePageContent() {
  const searchParams = useSearchParams();
  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  const name = searchParams.get('name');
  const type = searchParams.get('type') || 'movie';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const title = name ? decodeURIComponent(name) : 'Результаты';

  useEffect(() => {
    setPage(1);
  }, [genre, status, type]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let url = '';
        if (genre) {
          url =
            type === 'tv'
              ? `${TMDB_BASE_URL}/discover/tv?with_genres=${genre}&sort_by=popularity.desc&page=${page}`
              : `${TMDB_BASE_URL}/discover/movie?with_genres=${genre}&sort_by=popularity.desc&page=${page}`;
        } else if (status) {
          const path = STATUS_MAP[status];
          if (!path) {
            setLoading(false);
            return;
          }
          const sep = path.includes('?') ? '&' : '?';
          url = `${TMDB_BASE_URL}${path}${sep}page=${page}`;
        } else {
          setLoading(false);
          return;
        }

        const encodedUrl = encodeURIComponent(url);
        const res = await fetch(`/api/tmdb?path=${encodedUrl}`);
        const data = await res.json();
        setMovies(data.results ?? []);
        setTotalPages(Math.min(data.total_pages ?? 1, 20)); // TMDB лимит
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [genre, status, type, page]);

  return (
    <div className="container py-12 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/browse"
          className="flex items-center gap-2 text-[#999] hover:text-white transition text-sm">
          <ArrowLeft size={16} />
          Назад
        </Link>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <span className="text-[#999] text-sm">
          стр. {page} из {totalPages}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-[#999]">Загрузка...</div>
        </div>
      ) : movies.length === 0 ? (
        <p className="text-[#999]">Ничего не найдено.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {movies.map((movie) => {
            const mins = (movie.id % 70) + 85;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const duration =
              type === 'movie'
                ? `${h}h ${m}m`
                : `${(movie.id % 4) + 2} Seasons`;
            return (
              <Link
                key={movie.id}
                href={
                  type === 'movie'
                    ? `/movies/${movie.id}`
                    : `/shows/${movie.id}`
                }
                className="group rounded-xl border border-[#262628] bg-[#1A1A1A] p-3 hover:border-[#E50000] transition flex flex-col">
                <div className="relative aspect-2/3 overflow-hidden rounded-lg mb-3 bg-[#262628]">
                  <Image
                    src={
                      movie.poster_path
                        ? `${TMDB_IMAGE_URL}${movie.poster_path}`
                        : '/no-poster.png'
                    }
                    alt={movie.title || movie.name || ''}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h4 className="text-[14px] font-medium text-white truncate mb-2">
                  {movie.title || movie.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#999]">
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-[#666]" />
                    {duration}
                  </div>
                  <div className="flex items-center gap-1 bg-[#141414] border border-[#262628] px-2 py-0.5 rounded-full text-white">
                    <Star size={10} className="text-[#FFAD4B]" fill="#FFAD4B" />
                    {movie.vote_average?.toFixed(1) ?? '0.0'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] disabled:opacity-30 transition cursor-pointer">
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = page <= 4 ? i + 1 : page - 3 + i;
            if (p < 1 || p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition cursor-pointer ${
                  p === page
                    ? 'bg-[#E50000] text-white'
                    : 'bg-[#1A1A1A] border border-[#262628] text-[#999] hover:bg-[#262628] hover:text-white'
                }`}>
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] disabled:opacity-30 transition cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
