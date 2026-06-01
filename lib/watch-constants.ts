/** Маркер избранного в поле episodeId (схема Prisma не меняется). */
export const FAVORITE_EPISODE_ID = 'FAVORITE';

export function isFavoriteEntry(episodeId: string | null | undefined): boolean {
  if (!episodeId) return false;
  return (
    episodeId === FAVORITE_EPISODE_ID || episodeId.startsWith('FAVORITE:')
  );
}

export function stripFavoriteMarker(
  episodeId: string | null | undefined,
): string | null {
  if (!episodeId) return null;
  if (episodeId === FAVORITE_EPISODE_ID) return null;
  if (episodeId.startsWith('FAVORITE:')) {
    return episodeId.slice('FAVORITE:'.length) || null;
  }
  return episodeId;
}

export function withFavoriteMarker(episodeId: string | null | undefined): string {
  const base = stripFavoriteMarker(episodeId);
  return base ? `FAVORITE:${base}` : FAVORITE_EPISODE_ID;
}

/** Демо-поток, когда у TMDB нет прямого файла (полноценный HTML5-плеер). */
export const DEMO_STREAM_URL =
  process.env.DEMO_STREAM_URL ??
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
