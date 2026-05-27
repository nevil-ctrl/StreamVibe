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

export async function startWatchingMovie(movie: {
  id: number;
  title: string;
  poster_path: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/movies/${movie.id}`);
  }

  await ensureMovieInDb(movie);
  await recordMovieWatch(session.user.id, String(movie.id));
  revalidatePath(`/movies/${movie.id}`);
}

export async function startWatchingShow(show: {
  id: number;
  name: string;
  poster_path: string | null;
  episodeId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/shows/${show.id}`);
  }

  await ensureShowInDb(show);
  await recordShowWatch(
    session.user.id,
    String(show.id),
    show.episodeId,
  );
  revalidatePath(`/shows/${show.id}`);
}
