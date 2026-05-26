import { fetchTMDB } from '@/services/tmdb';
import { MovieResponse, Movie } from '@/types/movie';

export const getPopularMovies = async (): Promise<MovieResponse> => {
  return fetchTMDB('/movie/popular');
};

export const getTrendingMovies = async (): Promise<MovieResponse> => {
  return fetchTMDB('/trending/movie/week');
};

export const getTopRatedMovies = async (): Promise<MovieResponse> => {
  return fetchTMDB('/movie/top_rated');
};

export const getMovieById = async (id: number): Promise<Movie> => {
  return fetchTMDB(`/movie/${id}`);
};

export const getMovieGenres = async (): Promise<{
  genres: { id: number; name: string }[];
}> => {
  return fetchTMDB('/genre/movie/list');
};

export const searchMovies = async (query: string): Promise<MovieResponse> => {
  return fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}`);
};
