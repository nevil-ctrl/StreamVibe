import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMovieDetail } from '@/services/media-detail.service';
import WatchMovieClient from './WatchMovieClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function WatchMoviePage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const sp = await searchParams;
  const initialProgress = sp.t ? Number(sp.t) : 0;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/movie/${id}`);
  }

  const movieId = Number(id);
  if (Number.isNaN(movieId)) notFound();

  const movie = await getMovieDetail(movieId).catch(() => null);
  if (!movie) notFound();

  const movieRecord = movie as { imdb_id?: string | null; imdbId?: string | null };
  const imdbId = movieRecord.imdb_id ?? movieRecord.imdbId ?? null;

  return (
    <WatchMovieClient
      movieId={id}
      title={movie.title}
      imdbId={imdbId}
      initialProgress={
        Number.isFinite(initialProgress) && initialProgress > 0
          ? initialProgress
          : 0
      }
    />
  );
}
