import { Suspense } from 'react';
import ForgotPasswordClient from './ForgotPasswordClient';

interface TMDBMovie {
  poster_path: string;
  title: string;
  [key: string]: unknown;
}

async function getTrendingMovies() {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return [];

    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=ru-RU`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (
      data.results?.map((m: TMDBMovie) => ({
        poster_path: m.poster_path,
        title: m.title,
      })) || []
    );
  } catch (error) {
    console.error('Ошибка при получении фильмов для фона:', error);
    return [];
  }
}

export default async function ForgotPasswordPage() {
  const movies = await getTrendingMovies();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#141414] text-[#999999]">
          Загрузка...
        </div>
      }>
      <ForgotPasswordClient movies={movies} />
    </Suspense>
  );
}
