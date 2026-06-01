import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { listUserWatchHistory } from '@/services/watch-history.service';
import MediaHistoryGrid from '@/components/user/MediaHistoryGrid';

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const items = await listUserWatchHistory(session.user.id, 'completed');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">История</h1>
        <p className="mt-1 text-sm text-(--grey-60)">
          Завершённые фильмы и сериалы
        </p>
      </div>
      <MediaHistoryGrid
        items={items}
        emptyMessage="Вы ещё не завершили ни одного тайтла. Досмотрите до конца — тайтл появится здесь."
      />
    </div>
  );
}
