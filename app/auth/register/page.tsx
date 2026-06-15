import RegisterForm from './RegisterForm';
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
  } catch {
    return [];
  }
}

export default async function RegisterPage() {
  const movies = await getTrendingMovies();
  return <RegisterForm movies={movies} />;
}
