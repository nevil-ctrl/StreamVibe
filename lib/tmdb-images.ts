export const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';
export const TMDB_PROFILE_URL = 'https://image.tmdb.org/t/p/w185';
export const TMDB_STILL_URL = 'https://image.tmdb.org/t/p/w300';

export function tmdbPoster(path: string | null | undefined) {
  return path ? `${TMDB_POSTER_URL}${path}` : null;
}

export function tmdbBackdrop(path: string | null | undefined) {
  return path ? `${TMDB_BACKDROP_URL}${path}` : null;
}

export function tmdbProfile(path: string | null | undefined) {
  return path ? `${TMDB_PROFILE_URL}${path}` : null;
}

export function tmdbStill(path: string | null | undefined) {
  return path ? `${TMDB_STILL_URL}${path}` : null;
}
