import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';
import { verifyEmailToken } from '@/services/auth-token.service';
import { TMDBMovieShort } from '@/types/tmdb';

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

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const movies = await getTrendingMovies();

  let initialSuccess = false;
  let initialMessage = 'Токен не указан или ссылка недействительна.';

  if (token) {
    const verificationResult = await verifyEmailToken(token);
    initialSuccess = verificationResult.success;
    initialMessage = verificationResult.success
      ? 'Ваш email успешно подтвержден! Вы можете войти в систему.'
      : (verificationResult.message || 'Ошибка активации.');
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#141414] text-[#999999]">
          Загрузка...
        </div>
      }>
      <VerifyEmailClient
        movies={movies}
        initialSuccess={initialSuccess}
        initialMessage={initialMessage}
      />
    </Suspense>
  );
}
