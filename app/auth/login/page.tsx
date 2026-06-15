import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { TMDBMovieShort } from '@/types/tmdb';

async function getTrendingMovies() {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.error(
        'КРИТИЧЕСКАЯ ОШИБКА: Переменная TMDB_API_KEY не найдена в .env файле!',
      );
      return [];
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=ru-RU`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      console.error(`TMDB API вернул статус: ${res.status}`);
      return [];
    }

    const data = await res.json();

    return (
      data.results?.map((m: TMDBMovieShort) => ({
        poster_path: m.poster_path,
        title: m.title,
      })) || []
    );
  } catch (error) {
    console.error('Ошибка при получении фильмов для фона:', error);
    return [];
  }
}

export default async function LoginPage() {
  const movies = await getTrendingMovies();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#141414] text-[#999999]">
          Загрузка...
        </div>
      }>
      <LoginForm movies={movies} />
    </Suspense>
  );
}
