import { prisma, withRetry } from '@/lib/prisma';
import {
  encodeEpisodeMeta,
  episodeIdOnPlayStart,
  hasMarker,
  isFavoriteEntry,
  isWatchlistEntry,
  parseEpisodeMeta,
  toggleMarkerInMeta,
  type WatchMarker,
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

export type WatchListFilter =
  | 'all'
  | 'favorites'
  | 'watchlist'
  | 'in_progress'
  | 'completed';

async function ensureMediaInDb(media: {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
}) {
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
  } else {
    await prisma.show.upsert({
      where: { id: String(media.id) },
      update: {},
      create: {
        id: String(media.id),
        name: media.title,
        posterPath: media.poster_path,
      },
    });
  }
}

async function toggleMarker(
  userId: string,
  media: {
    type: 'movie' | 'tv';
    id: number;
    title: string;
    poster_path: string | null;
    episodeId?: string;
  },
  marker: WatchMarker,
): Promise<{ active: boolean }> {
  await ensureMediaInDb(media);

  const idStr = String(media.id);
  const isMovie = media.type === 'movie';

  const existing = await prisma.watchHistory.findUnique({
    where: isMovie
      ? { userId_movieId: { userId, movieId: idStr } }
      : { userId_showId: { userId, showId: idStr } },
  });

  const meta = parseEpisodeMeta(existing?.episodeId);
  const hasIt = meta.markers.includes(marker);

  if (hasIt) {
    const nextMeta = toggleMarkerInMeta(meta, marker, false);
    const nextEpisodeId = encodeEpisodeMeta(nextMeta);

    if (
      !nextEpisodeId &&
      (existing?.progress ?? 0) === 0 &&
      !existing?.isFinished
    ) {
      if (existing) {
        await prisma.watchHistory.delete({ where: { id: existing.id } });
      }
      return { active: false };
    }

    if (existing) {
      await prisma.watchHistory.update({
        where: { id: existing.id },
        data: { episodeId: nextEpisodeId },
      });
    }
    return { active: false };
  }

  let nextMeta = toggleMarkerInMeta(meta, marker, true);
  if (media.episodeId && !nextMeta.episodeTmdbId) {
    nextMeta = { ...nextMeta, episodeTmdbId: media.episodeId };
  }
  const nextEpisodeId = encodeEpisodeMeta(nextMeta)!;

  if (isMovie) {
    await prisma.watchHistory.upsert({
      where: { userId_movieId: { userId, movieId: idStr } },
      update: { episodeId: nextEpisodeId },
      create: {
        userId,
        movieId: idStr,
        progress: 0,
        episodeId: nextEpisodeId,
      },
    });
  } else {
    await prisma.watchHistory.upsert({
      where: { userId_showId: { userId, showId: idStr } },
      update: { episodeId: nextEpisodeId },
      create: {
        userId,
        showId: idStr,
        progress: 0,
        episodeId: nextEpisodeId,
      },
    });
  }

  return { active: true };
}

export async function getWatchEntry(
  userId: string,
  opts: { movieId?: string; showId?: string },
): Promise<WatchHistory | null> {
  if (opts.movieId) {
    return withRetry(
      () =>
        prisma.watchHistory.findUnique({
          where: { userId_movieId: { userId, movieId: opts.movieId! } },
        }),
      3,
    );
  }
  if (opts.showId) {
    return withRetry(
      () =>
        prisma.watchHistory.findUnique({
          where: { userId_showId: { userId, showId: opts.showId! } },
        }),
      3,
    );
  }
  return null;
}

export async function toggleFavorite(
  userId: string,
  media: Parameters<typeof toggleMarker>[1],
): Promise<{ favorited: boolean }> {
  const result = await toggleMarker(userId, media, 'FAVORITE');
  return { favorited: result.active };
}

export async function toggleWatchlist(
  userId: string,
  media: Parameters<typeof toggleMarker>[1],
): Promise<{ inWatchlist: boolean }> {
  const result = await toggleMarker(userId, media, 'WATCHLIST');
  return { inWatchlist: result.active };
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
  };

  if (opts.movieId) {
    const existing = await prisma.watchHistory.findUnique({
      where: { userId_movieId: { userId, movieId: opts.movieId } },
    });
    const episodeIdValue = episodeIdOnPlayStart(existing?.episodeId ?? null);

    return prisma.watchHistory.upsert({
      where: { userId_movieId: { userId, movieId: opts.movieId } },
      update: { ...data, episodeId: episodeIdValue },
      create: {
        userId,
        movieId: opts.movieId,
        ...data,
        episodeId: episodeIdValue,
      },
    });
  }

  if (opts.showId) {
    const existing = await prisma.watchHistory.findUnique({
      where: { userId_showId: { userId, showId: opts.showId } },
    });
    const episodeIdValue = episodeIdOnPlayStart(
      existing?.episodeId ?? null,
      episodeId ?? parseEpisodeMeta(existing?.episodeId).episodeTmdbId,
    );

    return prisma.watchHistory.upsert({
      where: { userId_showId: { userId, showId: opts.showId } },
      update: { ...data, episodeId: episodeIdValue },
      create: {
        userId,
        showId: opts.showId,
        ...data,
        episodeId: episodeIdValue,
      },
    });
  }

  return null;
}

export async function listUserWatchHistory(
  userId: string,
  filter: WatchListFilter,
): Promise<WatchHistoryWithMedia[]> {
  const rows = await prisma.watchHistory.findMany({
    where: { userId },
    include: mediaInclude,
    orderBy: { watchedAt: 'desc' },
  });

  return rows.filter((row) => {
    const favorite = isFavoriteEntry(row.episodeId);
    const watchlist = isWatchlistEntry(row.episodeId);
    const inProgress = row.progress > 0 && !row.isFinished;
    const completed = row.isFinished;

    switch (filter) {
      case 'favorites':
        return favorite;
      case 'watchlist':
        return watchlist;
      case 'in_progress':
        return inProgress;
      case 'completed':
        return completed;
      default:
        return row.progress > 0 || completed || favorite || watchlist;
    }
  });
}

export async function getUserWatchStats(userId: string) {
  const rows = await prisma.watchHistory.findMany({ where: { userId } });

  let favorites = 0;
  let watchlist = 0;
  let completed = 0;
  let inProgress = 0;

  for (const row of rows) {
    if (isFavoriteEntry(row.episodeId)) favorites += 1;
    if (isWatchlistEntry(row.episodeId)) watchlist += 1;
    if (row.isFinished) completed += 1;
    if (row.progress > 0 && !row.isFinished) inProgress += 1;
  }

  const totalWatched = rows.filter(
    (r) => r.progress > 0 || r.isFinished,
  ).length;

  return { totalWatched, favorites, watchlist, completed, inProgress };
}

export { isFavoriteEntry, isWatchlistEntry, hasMarker };
