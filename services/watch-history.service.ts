import { prisma } from '@/lib/prisma';
import {
  FAVORITE_EPISODE_ID,
  isFavoriteEntry,
  stripFavoriteMarker,
  withFavoriteMarker,
} from '@/lib/watch-constants';
import type { WatchHistory } from '@prisma/client';

export type WatchHistoryWithMedia = WatchHistory & {
  movie: { id: string; title: string; posterPath: string | null } | null;
  show: { id: string; name: string; posterPath: string | null } | null;
};

const mediaInclude = {
  movie: { select: { id: true, title: true, posterPath: true } },
  show: { select: { id: true, name: true, posterPath: true } },
} as const;

export async function getWatchEntry(
  userId: string,
  opts: { movieId?: string; showId?: string },
): Promise<WatchHistory | null> {
  if (opts.movieId) {
    return prisma.watchHistory.findUnique({
      where: { userId_movieId: { userId, movieId: opts.movieId } },
    });
  }
  if (opts.showId) {
    return prisma.watchHistory.findUnique({
      where: { userId_showId: { userId, showId: opts.showId } },
    });
  }
  return null;
}

export async function toggleFavorite(
  userId: string,
  media: {
    type: 'movie' | 'tv';
    id: number;
    title: string;
    poster_path: string | null;
    episodeId?: string;
  },
): Promise<{ favorited: boolean }> {
  if (media.type === 'movie') {
    await prisma.movie.upsert({
      where: { id: String(media.id) },
      update: {},
      create: {
        id: String(media.id),
        title: media.title,
        posterPath: media.poster_path,
      },
    });

    const existing = await prisma.watchHistory.findUnique({
      where: {
        userId_movieId: { userId, movieId: String(media.id) },
      },
    });

    if (existing && isFavoriteEntry(existing.episodeId)) {
      if (existing.progress > 0 || existing.isFinished) {
        await prisma.watchHistory.update({
          where: { id: existing.id },
          data: { episodeId: null },
        });
        return { favorited: false };
      }
      await prisma.watchHistory.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.watchHistory.upsert({
      where: {
        userId_movieId: { userId, movieId: String(media.id) },
      },
      update: { episodeId: FAVORITE_EPISODE_ID },
      create: {
        userId,
        movieId: String(media.id),
        progress: 0,
        episodeId: FAVORITE_EPISODE_ID,
      },
    });
    return { favorited: true };
  }

  await prisma.show.upsert({
    where: { id: String(media.id) },
    update: {},
    create: {
      id: String(media.id),
      name: media.title,
      posterPath: media.poster_path,
    },
  });

  const existing = await prisma.watchHistory.findUnique({
    where: { userId_showId: { userId, showId: String(media.id) } },
  });

  if (existing && isFavoriteEntry(existing.episodeId)) {
    const baseEpisode = stripFavoriteMarker(existing.episodeId);
    await prisma.watchHistory.update({
      where: { id: existing.id },
      data: { episodeId: baseEpisode },
    });
    return { favorited: false };
  }

  await prisma.watchHistory.upsert({
    where: { userId_showId: { userId, showId: String(media.id) } },
    update: {
      episodeId: withFavoriteMarker(
        existing?.episodeId ?? media.episodeId ?? null,
      ),
    },
    create: {
      userId,
      showId: String(media.id),
      progress: 0,
      episodeId: withFavoriteMarker(media.episodeId ?? null),
    },
  });
  return { favorited: true };
}

export async function updateWatchProgress(
  userId: string,
  opts: {
    movieId?: string;
    showId?: string;
    progressSeconds: number;
    durationSeconds: number;
    episodeId?: string;
  },
) {
  const { progressSeconds, durationSeconds, episodeId } = opts;
  const progress = Math.max(0, Math.floor(progressSeconds));
  const finished =
    durationSeconds > 0 && progressSeconds / durationSeconds >= 0.9;

  const data = {
    progress,
    isFinished: finished,
    watchedAt: new Date(),
    ...(episodeId !== undefined ? { episodeId } : {}),
  };

  if (opts.movieId) {
    const existing = await prisma.watchHistory.findUnique({
      where: { userId_movieId: { userId, movieId: opts.movieId } },
    });
    const episodeIdValue = isFavoriteEntry(existing?.episodeId ?? null)
      ? null
      : existing?.episodeId;

    return prisma.watchHistory.upsert({
      where: { userId_movieId: { userId, movieId: opts.movieId } },
      update: { ...data, episodeId: episodeIdValue },
      create: {
        userId,
        movieId: opts.movieId,
        ...data,
      },
    });
  }

  if (opts.showId) {
    const existing = await prisma.watchHistory.findUnique({
      where: { userId_showId: { userId, showId: opts.showId } },
    });
    let nextEpisodeId = episodeId ?? existing?.episodeId ?? null;
    if (isFavoriteEntry(nextEpisodeId)) {
      nextEpisodeId = stripFavoriteMarker(nextEpisodeId);
    }

    return prisma.watchHistory.upsert({
      where: { userId_showId: { userId, showId: opts.showId } },
      update: { ...data, episodeId: nextEpisodeId },
      create: {
        userId,
        showId: opts.showId,
        ...data,
        episodeId: nextEpisodeId,
      },
    });
  }

  return null;
}

export async function listUserWatchHistory(
  userId: string,
  filter: 'all' | 'favorites' | 'in_progress' | 'completed',
): Promise<WatchHistoryWithMedia[]> {
  const rows = await prisma.watchHistory.findMany({
    where: { userId },
    include: mediaInclude,
    orderBy: { watchedAt: 'desc' },
  });

  return rows.filter((row) => {
    const favorite = isFavoriteEntry(row.episodeId);
    const inProgress = row.progress > 0 && !row.isFinished;
    const completed = row.isFinished;

    switch (filter) {
      case 'favorites':
        return favorite;
      case 'in_progress':
        return inProgress;
      case 'completed':
        return completed;
      default:
        return row.progress > 0 || completed || favorite;
    }
  });
}

export async function getUserWatchStats(userId: string) {
  const rows = await prisma.watchHistory.findMany({ where: { userId } });

  let favorites = 0;
  let completed = 0;
  let inProgress = 0;

  for (const row of rows) {
    if (isFavoriteEntry(row.episodeId)) favorites += 1;
    if (row.isFinished) completed += 1;
    if (row.progress > 0 && !row.isFinished) inProgress += 1;
  }

  const totalWatched = rows.filter(
    (r) => r.progress > 0 || r.isFinished,
  ).length;

  return { totalWatched, favorites, completed, inProgress };
}
