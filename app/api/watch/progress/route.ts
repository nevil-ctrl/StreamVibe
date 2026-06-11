import { auth } from '@/auth';
import { updateWatchProgress } from '@/services/watch-history.service';
import { canRecordWatchHistory } from '@/lib/consent/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    movieId,
    showId,
    progressSeconds,
    durationSeconds,
    episodeId,
  } = body as {
    movieId?: string;
    showId?: string;
    progressSeconds?: number;
    durationSeconds?: number;
    episodeId?: string;
  };

  if (
    (!movieId && !showId) ||
    typeof progressSeconds !== 'number' ||
    typeof durationSeconds !== 'number'
  ) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (!(await canRecordWatchHistory())) {
    return Response.json({ success: true, saved: false });
  }

  const row = await updateWatchProgress(session.user.id, {
    movieId,
    showId,
    progressSeconds,
    durationSeconds,
    episodeId,
  });

  return Response.json({
    progress: row?.progress ?? 0,
    isFinished: row?.isFinished ?? false,
  });
}
