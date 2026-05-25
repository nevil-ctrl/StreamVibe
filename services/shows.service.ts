import { TMDB_BASE_URL, fetchTMDB } from '@/services/tmdb';
import { ShowResponse, Show } from '@/types/show';

export const getPopularShows = async (): Promise<ShowResponse> => {
  return fetchTMDB(`${TMDB_BASE_URL}/tv/popular`);
};

export const getTrendingShows = async (): Promise<ShowResponse> => {
  return fetchTMDB(`${TMDB_BASE_URL}/trending/tv/week`);
};

export const getTopRatedShows = async (): Promise<ShowResponse> => {
  return fetchTMDB(`${TMDB_BASE_URL}/tv/top_rated`);
};

export const getShowById = async (id: number): Promise<Show> => {
  return fetchTMDB(`${TMDB_BASE_URL}/tv/${id}`);
};
