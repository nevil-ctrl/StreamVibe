import { prisma } from '@/lib/prisma';
import type { LocalMediaData } from '@/types/media-detail';

export async function getLocalMovie(
  tmdbId: string,
): Promise<LocalMediaData | null> {
  const movie = await prisma.movie.findUnique({
    where: { id: tmdbId },
    include: {
      comments: {
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      _count: { select: { watchedBy: true } },
    },
  });

  if (!movie) return null;

  return {
    comments: movie.comments,
    watchersCount: movie._count.watchedBy,
  };
}

export async function getLocalShow(
  tmdbId: string,
): Promise<LocalMediaData | null> {
  const show = await prisma.show.findUnique({
    where: { id: tmdbId },
    include: {
      comments: {
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
        },
      },
      _count: { select: { watchedBy: true } },
    },
  });

  if (!show) return null;

  return {
    comments: show.comments,
    watchersCount: show._count.watchedBy,
  };
}

export async function ensureMovieInDb(data: {
  id: number;
  title: string;
  poster_path?: string | null;
}) {
  return prisma.movie.upsert({
    where: { id: String(data.id) },
    update: {},
    create: {
      id: String(data.id),
      title: data.title,
      posterPath: data.poster_path ?? null,
    },
  });
}

export async function ensureShowInDb(data: {
  id: number;
  name: string;
  poster_path?: string | null;
}) {
  return prisma.show.upsert({
    where: { id: String(data.id) },
    update: {},
    create: {
      id: String(data.id),
      name: data.name,
      posterPath: data.poster_path ?? null,
    },
  });
}

export async function recordMovieWatch(userId: string, movieId: string) {
  return prisma.watchHistory.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: { watchedAt: new Date() },
    create: { userId, movieId, progress: 0 },
  });
}

export async function recordShowWatch(
  userId: string,
  showId: string,
  episodeId?: string,
) {
  return prisma.watchHistory.upsert({
    where: { userId_showId: { userId, showId } },
    update: {
      watchedAt: new Date(),
      ...(episodeId ? { episodeId } : {}),
    },
    create: {
      userId,
      showId,
      progress: 0,
      episodeId: episodeId ?? null,
    },
  });
}
