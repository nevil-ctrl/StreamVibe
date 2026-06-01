import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { listUserWatchHistory } from '@/services/watch-history.service';
import MediaHistoryGrid from '@/components/user/MediaHistoryGrid';

export default async function MyListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const items = await listUserWatchHistory(session.user.id, 'watchlist');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Мой список</h1>
        <p className="mt-1 text-sm text-(--grey-60)">
          Тайтлы, которые вы хотите посмотреть позже
        </p>
      </div>
      <MediaHistoryGrid
        items={items}
        emptyMessage="Список пуст. Нажмите «+» на странице фильма или сериала."
      />
    </div>
  );
}
