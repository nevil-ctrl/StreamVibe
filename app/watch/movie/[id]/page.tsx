import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMovieDetail } from '@/services/media-detail.service';
import { getMoviePlaybackSources } from '@/services/tmdb-videos.service';
import { getWatchEntry } from '@/services/watch-history.service';
import { ensureMovieInDb } from '@/services/content.service';
import WatchMovieClient from './WatchMovieClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function WatchMoviePage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const { t } = await searchParams;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/movie/${id}`);
  }

  const movieId = Number(id);
  if (Number.isNaN(movieId)) notFound();

  const movie = await getMovieDetail(movieId).catch(() => null);
  if (!movie) notFound();

  await ensureMovieInDb({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
  });

  const [sources, history] = await Promise.all([
    getMoviePlaybackSources(movieId),
    getWatchEntry(session.user.id, { movieId: id }),
  ]);

  const initialProgress =
    t != null ? Number(t) : (history?.progress && history.progress > 0 ? history.progress : 0);

  return (
    <WatchMovieClient
      movieId={id}
      title={movie.title}
      sources={sources}
      initialProgress={Number.isFinite(initialProgress) ? initialProgress : 0}
    />
  );
}
