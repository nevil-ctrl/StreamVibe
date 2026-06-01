import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { listUserWatchHistory } from '@/services/watch-history.service';
import MediaHistoryGrid from '@/components/user/MediaHistoryGrid';

export default async function WatchedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const items = await listUserWatchHistory(session.user.id, 'in_progress');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Просмотры</h1>
        <p className="mt-1 text-sm text-(--grey-60)">
          Продолжите просмотр с того места, где остановились
        </p>
      </div>
      <MediaHistoryGrid
        items={items}
        emptyMessage="Нет активных просмотров. Нажмите Play Now на карточке фильма или сериала."
      />
    </div>
  );
}
