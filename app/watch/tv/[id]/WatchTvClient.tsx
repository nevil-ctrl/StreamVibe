'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/player/VideoPlayer';
import type { PlaybackSource } from '@/services/tmdb-videos.service';

interface WatchTvClientProps {
  showId: string;
  title: string;
  subtitle?: string;
  sources: PlaybackSource[];
  initialProgress: number;
  episodeId?: string;
}

export default function WatchTvClient({
  showId,
  title,
  subtitle,
  sources,
  initialProgress,
  episodeId,
}: WatchTvClientProps) {
  const saveProgress = useCallback(
    async (current: number, duration: number) => {
      await fetch('/api/watch/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          progressSeconds: current,
          durationSeconds: duration,
          episodeId,
        }),
      });
    },
    [showId, episodeId],
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] px-4 py-6 md:px-10">
      <Link
        href={`/shows/${showId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#999999] transition hover:text-white">
        <ArrowLeft size={16} />
        Назад к сериалу
      </Link>

      <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mb-4 mt-1 text-sm text-[#999999]">{subtitle}</p>
      )}

      <VideoPlayer
        title={subtitle ? `${title} — ${subtitle}` : title}
        sources={sources}
        initialProgress={initialProgress}
        onProgress={saveProgress}
      />
    </div>
  );
}
