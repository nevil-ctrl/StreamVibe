'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import {
  createReview,
  deleteReview,
  updateReview,
  ReviewAuthError,
} from '@/services/review.service';
import type { ReviewFormInput } from '@/lib/review-payload';

type MediaRef = {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
};

function mediaPath(media: MediaRef) {
  return media.type === 'movie' ? `/movies/${media.id}` : `/shows/${media.id}`;
}

async function requireSession(callbackUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export type ReviewActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitReviewAction(
  media: MediaRef,
  input: ReviewFormInput,
): Promise<ReviewActionResult> {
  try {
    const session = await requireSession(mediaPath(media));
    await createReview(session.user.id, media, input);
    revalidatePath(mediaPath(media));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Не удалось сохранить отзыв',
    };
  }
}

export async function updateReviewAction(
  reviewId: string,
  media: MediaRef,
  input: ReviewFormInput,
): Promise<ReviewActionResult> {
  try {
    const session = await requireSession(mediaPath(media));
    const role = session.user.role ?? Role.USER;
    await updateReview(reviewId, session.user.id, role, input);
    revalidatePath(mediaPath(media));
    return { ok: true };
  } catch (e) {
    if (e instanceof ReviewAuthError) {
      return { ok: false, error: 'Вы можете редактировать только свои отзывы' };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Не удалось обновить отзыв',
    };
  }
}

export async function deleteReviewAction(
  reviewId: string,
  media: MediaRef,
): Promise<ReviewActionResult> {
  try {
    const session = await requireSession(mediaPath(media));
    const role = session.user.role ?? Role.USER;
    await deleteReview(reviewId, session.user.id, role);
    revalidatePath(mediaPath(media));
    return { ok: true };
  } catch (e) {
    if (e instanceof ReviewAuthError) {
      return { ok: false, error: 'Вы можете удалять только свои отзывы' };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Не удалось удалить отзыв',
    };
  }
}
