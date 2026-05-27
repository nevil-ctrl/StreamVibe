import { Suspense } from 'react';
import SearchPage from '@/components/search/SearchPage';
import { getMovieGenres } from '@/services/movies.service';

export const metadata = {
  title: 'Поиск фильмов | StreamVibe',
};

async function SearchContent() {
  const { genres } = await getMovieGenres();
  return <SearchPage genres={genres} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-[#999999]">
          Загрузка поиска...
        </div>
      }>
      <SearchContent />
    </Suspense>
  );
}
