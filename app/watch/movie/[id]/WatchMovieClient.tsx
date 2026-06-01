'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/player/VideoPlayer';
import type { PlaybackSource } from '@/services/tmdb-videos.service';

interface WatchMovieClientProps {
  movieId: string;
  title: string;
  sources: PlaybackSource[];
  initialProgress: number;
}

export default function WatchMovieClient({
  movieId,
  title,
  sources,
  initialProgress,
}: WatchMovieClientProps) {
  const saveProgress = useCallback(
    async (current: number, duration: number) => {
      await fetch('/api/watch/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          progressSeconds: current,
          durationSeconds: duration,
        }),
      });
    },
    [movieId],
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] px-4 py-6 md:px-10">
      <Link
        href={`/movies/${movieId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#999999] transition hover:text-white">
        <ArrowLeft size={16} />
        Назад к фильму
      </Link>

      <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">{title}</h1>

      <VideoPlayer
        title={title}
        sources={sources}
        initialProgress={initialProgress}
        onProgress={saveProgress}
      />
    </div>
  );
}
