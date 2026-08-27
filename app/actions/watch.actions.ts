'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ensureMovieInDb,
  ensureShowInDb,
  recordMovieWatch,
  recordShowWatch,
} from '@/services/content.service';
import {
  toggleFavorite,
  toggleWatchlist,
} from '@/services/watch-history.service';
import { canRecordWatchHistory } from '@/lib/consent/server';
import { hasWatchAccess } from '@/lib/subscription';

export async function startWatchingMovie(movie: {
  id: number;
  title: string;
  poster_path: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/watch/movie/${movie.id}`);
  }

  if (!(await hasWatchAccess(session.user.id, session.user.role))) {
    redirect('/subscriptions?required=watch');
  }

  if (await canRecordWatchHistory()) {
    await ensureMovieInDb(movie);
    await recordMovieWatch(session.user.id, String(movie.id));
  }

  redirect(`/watch/movie/${movie.id}`);
}

export async function startWatchingShow(show: {
  id: number;
  name: string;
  poster_path: string | null;
  episodeId?: string;
  season?: number;
  episode?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/shows/${show.id}`);
  }

  if (!(await hasWatchAccess(session.user.id, session.user.role))) {
    redirect('/subscriptions?required=watch');
  }

  if (await canRecordWatchHistory()) {
    await ensureShowInDb(show);
    await recordShowWatch(session.user.id, String(show.id), show.episodeId);
  }

  const params = new URLSearchParams();
  if (show.episodeId) params.set('episodeId', show.episodeId);
  if (show.season != null) params.set('season', String(show.season));
  if (show.episode != null) params.set('episode', String(show.episode));

  const qs = params.toString();
  redirect(`/watch/tv/${show.id}${qs ? `?${qs}` : ''}`);
}

export async function toggleFavoriteMedia(media: {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
  episodeId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/auth/login?callbackUrl=/${media.type === 'movie' ? 'movies' : 'shows'}/${media.id}`,
    );
  }

  const result = await toggleFavorite(session.user.id, media);

  revalidatePath(`/movies/${media.id}`);
  revalidatePath(`/shows/${media.id}`);
  revalidatePath('/user/profile');
  revalidatePath('/user/favorites');
  revalidatePath('/user/my-list');

  return result;
}

export async function toggleWatchlistMedia(media: {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
  episodeId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/auth/login?callbackUrl=/${media.type === 'movie' ? 'movies' : 'shows'}/${media.id}`,
    );
  }

  const result = await toggleWatchlist(session.user.id, media);

  revalidatePath(`/movies/${media.id}`);
  revalidatePath(`/shows/${media.id}`);
  revalidatePath('/user/profile');
  revalidatePath('/user/my-list');

  return result;
}
