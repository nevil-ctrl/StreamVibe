import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '@/config/env';
import { Movie, MovieResponse } from '@/types/movie';

const options = {
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

export const getPopularMovies = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/movie/popular`, options);
  return res.json();
};

export const getTrendingMovies = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week`, options);
  return res.json();
};

export const getTopRatedMovies = async (): Promise<MovieResponse> => {
  const res = await fetch(`${TMDB_BASE_URL}/movie/top_rated`, options);
  return res.json();
};

export const getMovieById = async (id: number): Promise<Movie> => {
  const res = await fetch(`${TMDB_BASE_URL}/movie/${id}`, options);
  return res.json();
};
