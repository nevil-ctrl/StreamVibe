import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '@/config/env';
import { Show, ShowResponse } from '@/types/show';

const options = {
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

export const getPopularShows = async (): Promise<ShowResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/tv/popular`, options);
  return res.json();
};

export const getTrendingShows = async (): Promise<ShowResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week`, options);
  return res.json();
};

export const getTopRatedShows = async (): Promise<ShowResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/tv/top_rated`, options);
  return res.json();
};

export const getShowById = async (id: number): Promise<Show> => {
  const res = await fetch(`${TMDB_BASE_URL}/tv/${id}`, options);
  return res.json();
};
