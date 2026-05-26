import { fetchTMDB } from '@/services/tmdb';
import { ShowResponse, Show } from '@/types/show';

export const getPopularShows = async (): Promise<ShowResponse> => {
  return fetchTMDB('/tv/popular');
};

export const getTrendingShows = async (): Promise<ShowResponse> => {
  return fetchTMDB('/trending/tv/week');
};

export const getTopRatedShows = async (): Promise<ShowResponse> => {
  return fetchTMDB('/tv/top_rated');
};

export const getShowById = async (id: number): Promise<Show> => {
  return fetchTMDB(`/tv/${id}`);
};

export const getShowGenres = async (): Promise<{
  genres: { id: number; name: string }[];
}> => {
  return fetchTMDB('/genre/tv/list');
};

export const searchShows = async (query: string): Promise<ShowResponse> => {
  return fetchTMDB(`/search/tv?query=${encodeURIComponent(query)}`);
};
