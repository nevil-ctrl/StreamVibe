/** Единая 5-балльная шкала в приложении. */
export const RATING_MAX = 5;

/** TMDB: vote_average и author_details.rating — шкала 0–10. */
export function tmdbToFiveScale(value: number): number {
  return Math.min(RATING_MAX, Math.max(0, value / 2));
}

/** Старые отзывы могли храниться как 1–10. */
export function normalizeUserRating(value: number): number {
  const scaled = value > RATING_MAX ? value / 2 : value;
  return Math.min(RATING_MAX, Math.max(1, Math.round(scaled)));
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}
