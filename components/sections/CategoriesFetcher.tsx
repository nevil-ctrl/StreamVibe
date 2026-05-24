import { TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from '@/config/env';
import CategoriesSection from './CategoriesSection';

type Genre = { id: number; name: string };
type Movie = { id: number; poster_path: string; title: string };

// Описываем четкую структуру категории для TypeScript
interface PseudoCategory {
  id: string | number;
  name: string;
  type: string;
}

async function fetchTMDB(url: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  });
  return res.json();
}

async function getGenres(): Promise<Genre[]> {
  const data = await fetchTMDB(`${TMDB_BASE_URL}/genre/movie/list`);
  return data.genres ?? [];
}

async function getMovies(url: string): Promise<Movie[]> {
  const data = await fetchTMDB(url);
  return data.results ?? [];
}

export default async function CategoriesFetcher() {
  const genres = await getGenres();

  const pseudoCategories: PseudoCategory[] = [
    { id: 'trending', name: ' Trending', type: 'trending' },
    { id: 'popular', name: ' Popular', type: 'popular' },
    { id: 'top_rated', name: ' Top Rated', type: 'top_rated' },
    { id: 'now_playing', name: ' Now Playing', type: 'now_playing' },
    { id: 'upcoming', name: ' Upcoming', type: 'upcoming' },
  ];

  const genreCategories: PseudoCategory[] = genres.map((g) => ({
    id: g.id,
    name: g.name,
    type: 'genre',
  }));

  const categories = [...pseudoCategories, ...genreCategories];

  const fullCategories = await Promise.all(
    categories.map(async (cat) => {
      let url = '';

      switch (cat.type) {
        case 'trending':
          url = `${TMDB_BASE_URL}/trending/movie/week`;
          break;

        case 'popular':
          url = `${TMDB_BASE_URL}/movie/popular`;
          break;

        case 'top_rated':
          url = `${TMDB_BASE_URL}/movie/top_rated`;
          break;

        case 'now_playing':
          url = `${TMDB_BASE_URL}/movie/now_playing`;
          break;

        case 'upcoming':
          url = `${TMDB_BASE_URL}/movie/upcoming`;
          break;

        default:
          url = `${TMDB_BASE_URL}/discover/movie?with_genres=${cat.id}&sort_by=popularity.desc`;
      }

      const movies = await getMovies(url);

      return {
        id: cat.id,
        name: cat.name,
        movies,
      };
    }),
  );

  // Ошибка исчезнет, так как типы ID в fullCategories теперь полностью совпадают с ожидаемыми в секции
  return <CategoriesSection categories={fullCategories} type="movie" />;
}
