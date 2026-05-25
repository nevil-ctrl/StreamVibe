import { fetchTMDB, TMDB_BASE_URL } from '@/lib/tmdb';

export const getTrendingMovies = () =>
  fetchTMDB(`${TMDB_BASE_URL}/trending/movie/week`);

export const getPopularMovies = () =>
  fetchTMDB(`${TMDB_BASE_URL}/movie/popular`);

export const getTopRatedMovies = () =>
  fetchTMDB(`${TMDB_BASE_URL}/movie/top_rated`);

export const getUpcomingMovies = () =>
  fetchTMDB(`${TMDB_BASE_URL}/movie/upcoming`);

export const getNowPlayingMovies = () =>
  fetchTMDB(`${TMDB_BASE_URL}/movie/now_playing`);
