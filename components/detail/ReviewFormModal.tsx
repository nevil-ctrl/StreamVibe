'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import {
  submitReviewAction,
  updateReviewAction,
  type ReviewActionResult,
} from '@/app/actions/review.actions';
import type { ReviewFormInput } from '@/lib/review-payload';
import { RATING_MAX } from '@/lib/rating';

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  reviewId?: string;
  initial?: ReviewFormInput;
  media: {
    type: 'movie' | 'tv';
    id: number;
    title: string;
    poster_path: string | null;
  };
  onSuccess: () => void;
}

export default function ReviewFormModal({
  open,
  onClose,
  mode,
  reviewId,
  initial,
  media,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(initial?.rating ?? 4);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open && initial) {
      setRating(initial.rating);
      setTitle(initial.title ?? '');
      setBody(initial.body);
      setError(null);
    }
    if (open && !initial) {
      setRating(4);
      setTitle('');
      setBody('');
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: ReviewFormInput = {
      rating,
      title: title.trim() || undefined,
      body: body.trim(),
    };

    startTransition(async () => {
      let result: ReviewActionResult;
      if (mode === 'edit' && reviewId) {
        result = await updateReviewAction(reviewId, media, input);
      } else {
        result = await submitReviewAction(media, input);
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onSuccess();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#999999] transition hover:text-white">
          <X size={20} />
        </button>

        <h3
          id="review-modal-title"
          className="mb-1 text-lg font-bold text-white">
          {mode === 'create' ? 'Ваш отзыв' : 'Редактировать отзыв'}
        </h3>
        <p className="mb-5 text-sm text-[#999999]">{media.title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[#CCCCCC]">
              Оценка <span className="text-[#E50000]">*</span> ({rating}/{RATING_MAX})
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: RATING_MAX }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded p-0.5 transition hover:scale-110">
                    <Star
                      size={22}
                      className={
                        value <= rating ? 'text-[#E50000]' : 'text-[#333333]'
                      }
                      fill={value <= rating ? '#E50000' : 'transparent'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-title"
              className="mb-1 block text-sm text-[#CCCCCC]">
              Заголовок (необязательно)
            </label>
            <input
              id="review-title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Отличный сюжет"
              className="w-full rounded-lg border border-[#262628] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#E50000]"
            />
          </div>

          <div>
            <label
              htmlFor="review-body"
              className="mb-1 block text-sm text-[#CCCCCC]">
              Текст отзыва <span className="text-[#E50000]">*</span>
            </label>
            <textarea
              id="review-body"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Поделитесь впечатлениями (минимум 10 символов)..."
              className="w-full resize-y rounded-lg border border-[#262628] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#E50000]"
            />
            <p className="mt-1 text-right text-xs text-[#666666]">
              {body.length}/2000
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-[#262628] px-4 py-2 text-sm text-white hover:bg-[#262628] disabled:opacity-50">
              Отмена
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-[#E50000] px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {pending && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? 'Опубликовать' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
