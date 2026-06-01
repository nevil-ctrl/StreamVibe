import { z } from 'zod';
import { RATING_MAX, normalizeUserRating } from '@/lib/rating';

const REVIEW_PREFIX = 'STREAMVIBE_REVIEW:v1:';

export const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1).max(RATING_MAX),
  title: z
    .string()
    .max(120, 'Заголовок не длиннее 120 символов')
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .min(10, 'Текст отзыва — минимум 10 символов')
    .max(2000, 'Текст отзыва — максимум 2000 символов'),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;

export interface ReviewPayload {
  rating: number;
  title: string | null;
  body: string;
}

export function encodeReviewContent(payload: ReviewPayload): string {
  return (
    REVIEW_PREFIX +
    JSON.stringify({
      rating: payload.rating,
      title: payload.title?.trim() || null,
      body: payload.body.trim(),
    })
  );
}

export function parseReviewContent(content: string): {
  isStructured: boolean;
  payload: ReviewPayload;
} {
  if (content.startsWith(REVIEW_PREFIX)) {
    try {
      const raw = JSON.parse(content.slice(REVIEW_PREFIX.length)) as {
        rating?: number;
        title?: string | null;
        body?: string;
      };
      const rating =
        typeof raw.rating === 'number'
          ? normalizeUserRating(raw.rating)
          : 3;
      const body = typeof raw.body === 'string' ? raw.body : content;
      return {
        isStructured: true,
        payload: {
          rating,
          title: raw.title?.trim() || null,
          body,
        },
      };
    } catch {
      /* fallback */
    }
  }

  return {
    isStructured: false,
    payload: {
      rating: 0,
      title: null,
      body: content,
    },
  };
}
