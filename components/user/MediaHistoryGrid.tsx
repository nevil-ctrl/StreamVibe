import Image from 'next/image';
import Link from 'next/link';
import { tmdbPoster } from '@/lib/tmdb-images';
import {
  episodeIdForPlayback,
  isFavoriteEntry,
  isWatchlistEntry,
} from '@/lib/watch-constants';
import type { WatchHistoryWithMedia } from '@/services/watch-history.service';

interface MediaHistoryGridProps {
  items: WatchHistoryWithMedia[];
  emptyMessage: string;
}

function itemHref(item: WatchHistoryWithMedia): string {
  if (item.movieId) {
    const progress = item.progress > 0 ? `?t=${item.progress}` : '';
    return `/watch/movie/${item.movieId}${progress}`;
  }
  if (item.showId) {
    const ep = episodeIdForPlayback(item.episodeId);
    const q = ep ? `?episodeId=${ep}` : '';
    return `/watch/tv/${item.showId}${q}`;
  }
  return '#';
}

function itemTitle(item: WatchHistoryWithMedia): string {
  return item.movie?.title ?? item.show?.name ?? 'Без названия';
}

function itemPoster(item: WatchHistoryWithMedia): string | null {
  const path = item.movie?.posterPath ?? item.show?.posterPath;
  return tmdbPoster(path);
}

export default function MediaHistoryGrid({
  items,
  emptyMessage,
}: MediaHistoryGridProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-(--black-15) bg-(--black-08) p-10 text-center text-(--grey-60)">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => {
        const poster = itemPoster(item);
        const favorite = isFavoriteEntry(item.episodeId);
        const watchlist = isWatchlistEntry(item.episodeId);
        const detailPath = item.movieId
          ? `/movies/${item.movieId}`
          : `/shows/${item.showId}`;

        return (
          <div
            key={item.id}
            className="group overflow-hidden rounded-xl border border-(--black-15) bg-(--black-08) transition hover:border-(--red-45)/50">
            <Link href={itemHref(item)} className="block">
              <div className="relative aspect-[2/3] bg-(--black-06)">
                {poster ? (
                  <Image
                    src={poster}
                    alt={itemTitle(item)}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-(--grey-60)">
                    Нет постера
                  </div>
                )}
                {item.isFinished && (
                  <span className="absolute left-2 top-2 rounded bg-green-600/90 px-2 py-0.5 text-[10px] font-medium text-white">
                    Завершено
                  </span>
                )}
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  {watchlist && (
                    <span className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-black">
                      +
                    </span>
                  )}
                  {favorite && (
                    <span className="rounded bg-(--red-45)/90 px-2 py-0.5 text-[10px] font-medium text-white">
                      ♥
                    </span>
                  )}
                </div>
                {item.progress > 0 && !item.isFinished && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-(--red-45)"
                      style={{ width: '40%' }}
                    />
                  </div>
                )}
              </div>
            </Link>
            <div className="p-3">
              <Link
                href={detailPath}
                className="line-clamp-2 text-sm font-medium text-white hover:text-(--red-45)">
                {itemTitle(item)}
              </Link>
              {item.progress > 0 && (
                <p className="mt-1 text-xs text-(--grey-60)">
                  Продолжить с {Math.floor(item.progress / 60)} мин
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
