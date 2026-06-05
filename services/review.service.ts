import { prisma } from '@/lib/prisma';
import {
  encodeReviewContent,
  parseReviewContent,
  reviewFormSchema,
  type ReviewFormInput,
} from '@/lib/review-payload';
import { Role } from '@/types/role';
import { ensureMovieInDb, ensureShowInDb } from '@/services/content.service';

export class ReviewAuthError extends Error {
  constructor(message = 'Недостаточно прав') {
    super(message);
    this.name = 'ReviewAuthError';
  }
}

function canModify(
  actorId: string,
  actorRole: Role,
  ownerId: string,
): boolean {
  return actorRole === Role.ADMIN || actorId === ownerId;
}

export async function listMediaReviews(opts: {
  movieId?: string;
  showId?: string;
  limit?: number;
}) {
  const where = opts.movieId
    ? { movieId: opts.movieId }
    : { showId: opts.showId! };

  return prisma.comment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: opts.limit ?? 24,
    include: {
      user: { select: { id: true, name: true, image: true, role: true } },
    },
  });
}

export async function getUserReviewForMedia(
  userId: string,
  opts: { movieId?: string; showId?: string },
) {
  return prisma.comment.findFirst({
    where: {
      userId,
      ...(opts.movieId ? { movieId: opts.movieId } : { showId: opts.showId }),
    },
    include: {
      user: { select: { id: true, name: true, image: true, role: true } },
    },
  });
}

export async function createReview(
  userId: string,
  media: {
    type: 'movie' | 'tv';
    id: number;
    title: string;
    poster_path: string | null;
  },
  input: ReviewFormInput,
) {
  const parsed = reviewFormSchema.parse(input);
  const mediaId = String(media.id);

  const existing = await getUserReviewForMedia(userId, {
    movieId: media.type === 'movie' ? mediaId : undefined,
    showId: media.type === 'tv' ? mediaId : undefined,
  });

  if (existing) {
    throw new Error('У вас уже есть отзыв на этот тайтл. Отредактируйте существующий.');
  }

  if (media.type === 'movie') {
    await ensureMovieInDb({
      id: media.id,
      title: media.title,
      poster_path: media.poster_path,
    });
  } else {
    await ensureShowInDb({
      id: media.id,
      name: media.title,
      poster_path: media.poster_path,
    });
  }

  const content = encodeReviewContent({
    rating: parsed.rating,
    title: parsed.title?.trim() || null,
    body: parsed.body,
  });

  return prisma.comment.create({
    data: {
      userId,
      content,
      movieId: media.type === 'movie' ? mediaId : null,
      showId: media.type === 'tv' ? mediaId : null,
    },
    include: {
      user: { select: { id: true, name: true, image: true, role: true } },
    },
  });
}

export async function updateReview(
  reviewId: string,
  actorId: string,
  actorRole: Role,
  input: ReviewFormInput,
) {
  const parsed = reviewFormSchema.parse(input);
  const review = await prisma.comment.findUnique({ where: { id: reviewId } });

  if (!review) throw new Error('Отзыв не найден');
  if (!canModify(actorId, actorRole, review.userId)) {
    throw new ReviewAuthError();
  }

  const content = encodeReviewContent({
    rating: parsed.rating,
    title: parsed.title?.trim() || null,
    body: parsed.body,
  });

  return prisma.comment.update({
    where: { id: reviewId },
    data: { content },
    include: {
      user: { select: { id: true, name: true, image: true, role: true } },
    },
  });
}

export async function deleteReview(
  reviewId: string,
  actorId: string,
  actorRole: Role,
) {
  const review = await prisma.comment.findUnique({ where: { id: reviewId } });

  if (!review) throw new Error('Отзыв не найден');
  if (!canModify(actorId, actorRole, review.userId)) {
    throw new ReviewAuthError();
  }

  await prisma.comment.delete({ where: { id: reviewId } });
  return { ok: true };
}

export function toReviewView(comment: {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: Role;
  };
}) {
  const { payload } = parseReviewContent(comment.content);
  return {
    id: comment.id,
    userId: comment.userId,
    author: comment.user.name ?? 'Пользователь',
    avatar: comment.user.image,
    userRole: comment.user.role,
    rating: payload.rating,
    title: payload.title,
    body: payload.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isEdited: comment.updatedAt > comment.createdAt,
  };
}
