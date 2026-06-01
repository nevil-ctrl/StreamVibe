import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { listUserWatchHistory } from '@/services/watch-history.service';
import MediaHistoryGrid from '@/components/user/MediaHistoryGrid';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const items = await listUserWatchHistory(session.user.id, 'favorites');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Избранное</h1>
        <p className="mt-1 text-sm text-(--grey-60)">
          Фильмы и сериалы, которые вы добавили в избранное
        </p>
      </div>
      <MediaHistoryGrid
        items={items}
        emptyMessage="В избранном пока ничего нет. Нажмите «лайк» на странице фильма или сериала."
      />
    </div>
  );
}
