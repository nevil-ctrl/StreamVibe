import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMovieDetail } from '@/services/media-detail.service';
import WatchMovieClient from './WatchMovieClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchMoviePage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/movie/${id}`);
  }

  const movieId = Number(id);
  if (Number.isNaN(movieId)) notFound();

  const movie = await getMovieDetail(movieId).catch(() => null);
  if (!movie) notFound();

  const rawMovie = movie as any;
  const imdbId = rawMovie.imdb_id || rawMovie.imdbId || null;

  return <WatchMovieClient movieId={id} title={movie.title} imdbId={imdbId} />;
}
