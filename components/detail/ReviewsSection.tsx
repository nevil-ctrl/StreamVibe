'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { TMDBReview, LocalComment } from '@/types/media-detail';
import { tmdbProfile } from '@/lib/tmdb-images';
import { parseReviewContent } from '@/lib/review-payload';
import { formatRating, RATING_MAX, tmdbToFiveScale } from '@/lib/rating';
import {
  deleteReviewAction,
  type ReviewActionResult,
} from '@/app/actions/review.actions';
import ReviewFormModal from './ReviewFormModal';

interface ReviewItem {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  title: string | null;
  avatar: string | null;
  source: 'tmdb' | 'local';
  userId?: string;
  isEdited?: boolean;
  createdAt?: Date;
}

interface ReviewsSectionProps {
  tmdbReviews: TMDBReview[];
  localComments?: LocalComment[];
  media: {
    type: 'movie' | 'tv';
    id: number;
    title: string;
    poster_path: string | null;
  };
  currentUserId?: string | null;
  currentUserRole?: 'USER' | 'ADMIN' | null;
  userOwnReview?: LocalComment | null;
}

function mapReviews(
  tmdbReviews: TMDBReview[],
  localComments: LocalComment[],
): ReviewItem[] {
  const tmdb = tmdbReviews.slice(0, 8).map((r) => ({
    id: r.id,
    author: r.author,
    content: r.content,
    rating:
      r.author_details?.rating != null
        ? tmdbToFiveScale(r.author_details.rating)
        : null,
    title: null,
    avatar: tmdbProfile(r.author_details?.avatar_path ?? null),
    source: 'tmdb' as const,
  }));

  const local = localComments.map((c) => {
    const { payload } = parseReviewContent(c.content);
    return {
      id: c.id,
      author: c.user.name ?? 'Пользователь',
      content: payload.body,
      rating: payload.rating > 0 ? payload.rating : null,
      title: payload.title,
      avatar: c.user.image,
      source: 'local' as const,
      userId: c.userId,
      isEdited: c.updatedAt > c.createdAt,
      createdAt: c.createdAt,
    };
  });

  return [...local, ...tmdb];
}

function StarsDisplay({ rating }: { rating: number }) {
  const filled = Math.round(Math.min(RATING_MAX, Math.max(0, rating)));
  return (
    <div className="mb-2 flex items-center gap-0.5">
      {Array.from({ length: RATING_MAX }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < filled ? 'text-[#E50000]' : 'text-[#333333]'
          }
          fill={i < filled ? '#E50000' : 'transparent'}
        />
      ))}
      <span className="ml-1 text-xs text-[#999999]">
        {formatRating(rating)}/{RATING_MAX}
      </span>
    </div>
  );
}

export default function ReviewsSection({
  tmdbReviews,
  localComments = [],
  media,
  currentUserId,
  currentUserRole,
  userOwnReview,
}: ReviewsSectionProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, startDeleteTransition] = useTransition();

  const reviews = mapReviews(tmdbReviews, localComments);

  const ownReviewPayload = userOwnReview
    ? parseReviewContent(userOwnReview.content).payload
    : null;

  const canModify = (review: ReviewItem) => {
    if (review.source !== 'local' || !review.userId) return false;
    if (currentUserRole === 'ADMIN') return true;
    return currentUserId === review.userId;
  };

  const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(
    media.type === 'movie' ? `/movies/${media.id}` : `/shows/${media.id}`,
  )}`;

  const openCreate = () => {
    if (!currentUserId) {
      window.location.href = loginUrl;
      return;
    }
    if (userOwnReview) {
      const item = reviews.find((r) => r.id === userOwnReview.id);
      if (item) openEdit(item);
      return;
    }
    setEditingReview(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (review: ReviewItem) => {
    if (!currentUserId) {
      window.location.href = loginUrl;
      return;
    }
    setEditingReview(review);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (reviewId: string) => {
    if (!confirm('Удалить этот отзыв?')) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result: ReviewActionResult = await deleteReviewAction(
        reviewId,
        media,
      );
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const scroll = (dir: 'left' | 'right') => {
    const next =
      dir === 'right'
        ? Math.min(reviews.length - 1, activeIndex + 1)
        : Math.max(0, activeIndex - 1);
    setActiveIndex(next);
    trackRef.current?.children[next]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <>
      <section className="rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Отзывы</h2>
          <button
            type="button"
            onClick={openCreate}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#262628] bg-[#141414] px-4 py-2 text-sm text-white transition hover:border-[#E50000]">
            <Plus size={16} />
            {userOwnReview ? 'Мой отзыв' : 'Добавить отзыв'}
          </button>
        </div>

        {deleteError && (
          <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400">
            {deleteError}
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-[#999999]">
            Отзывов пока нет. Станьте первым после просмотра!
          </p>
        ) : (
          <>
            <div
              ref={trackRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}>
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="w-[min(100%,420px)] shrink-0 snap-center rounded-xl border border-[#262628] bg-[#141414] p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#262628]">
                        {review.avatar ? (
                          <Image
                            src={review.avatar}
                            alt={review.author}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#666666]">
                            {review.author[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {review.author}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {review.source === 'local'
                            ? `StreamVibe${review.isEdited ? ' · изменён' : ''}`
                            : 'TMDB'}
                        </p>
                      </div>
                    </div>

                    {canModify(review) && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(review)}
                          title="Редактировать"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262628] text-[#999999] transition hover:border-[#E50000] hover:text-white">
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          disabled={pendingDelete}
                          title="Удалить"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262628] text-[#999999] transition hover:border-red-600 hover:text-red-500 disabled:opacity-50">
                          {pendingDelete ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {review.title && (
                    <p className="mb-1 text-sm font-semibold text-white">
                      {review.title}
                    </p>
                  )}

                  {review.rating != null && review.rating > 0 && (
                    <StarsDisplay rating={review.rating} />
                  )}

                  <p className="line-clamp-6 text-sm leading-relaxed text-[#999999]">
                    {review.content}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {reviews.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === activeIndex ? 'w-6 bg-[#E50000]' : 'w-3 bg-[#333333]'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={activeIndex === 0}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30 disabled:opacity-40">
                  <ArrowLeft size={16} className="text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={activeIndex >= reviews.length - 1}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30 disabled:opacity-40">
                  <ArrowRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <ReviewFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReview(null);
        }}
        mode={modalMode}
        reviewId={
          modalMode === 'edit'
            ? (editingReview?.id ?? userOwnReview?.id)
            : undefined
        }
        initial={
          modalMode === 'edit' && editingReview
            ? {
                rating: editingReview.rating ?? 4,
                title: editingReview.title ?? undefined,
                body: editingReview.content,
              }
            : ownReviewPayload && modalMode === 'edit'
              ? {
                  rating: ownReviewPayload.rating,
                  title: ownReviewPayload.title ?? undefined,
                  body: ownReviewPayload.body,
                }
              : undefined
        }
        media={media}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
