'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { PlaybackSource } from '@/services/tmdb-videos.service';

interface VideoPlayerProps {
  title: string;
  sources: PlaybackSource[];
  initialProgress?: number;
  onProgress?: (current: number, duration: number) => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoPlayer({
  title,
  sources,
  initialProgress = 0,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveRef = useRef(0);

  const mp4Source = sources.find((s) => s.kind === 'mp4');
  const youtubeSource = sources.find((s) => s.kind === 'youtube');

  const [mode, setMode] = useState<'mp4' | 'youtube'>(
    mp4Source ? 'mp4' : 'youtube',
  );
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing && mode === 'mp4') setShowControls(false);
    }, 3000);
  }, [playing, mode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== 'mp4' || !mp4Source) return;

    const onLoaded = () => {
      setDuration(video.duration);
      if (initialProgress > 0 && initialProgress < video.duration - 5) {
        video.currentTime = initialProgress;
        setCurrent(initialProgress);
      }
    };

    const onTimeUpdate = () => {
      setCurrent(video.currentTime);
      const now = Date.now();
      if (now - progressSaveRef.current > 5000 && onProgress) {
        progressSaveRef.current = now;
        onProgress(video.currentTime, video.duration || 0);
      }
    };

    const onEnded = () => {
      setPlaying(false);
      onProgress?.(video.duration, video.duration || 0);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [mode, mp4Source, initialProgress, onProgress]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || mode !== 'mp4') return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
      onProgress?.(video.currentTime, video.duration || 0);
    }
    resetHideTimer();
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || mode !== 'mp4') return;
    video.currentTime = value;
    setCurrent(value);
    resetHideTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (mode === 'youtube' && youtubeSource) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {mp4Source && (
            <button
              type="button"
              onClick={() => setMode('mp4')}
              className="rounded-lg border border-[#262628] bg-[#141414] px-3 py-1.5 text-xs text-white hover:border-[#E50000]">
              Полный плеер (демо)
            </button>
          )}
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${youtubeSource.key}?autoplay=0&rel=0`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-[#999999]">
          Режим трейлера (YouTube). Для перемотки и паузы как в Kinopoisk
          переключитесь на «Полный плеер».
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}>
      <video
        ref={videoRef}
        src={mp4Source?.url}
        className="h-full w-full object-contain"
        playsInline
        onClick={togglePlay}
      />

      <div
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
        <div className="pointer-events-auto px-4 pb-4 pt-8">
          <p className="mb-2 truncate text-sm font-medium text-white">{title}</p>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            className="mb-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-[#E50000]"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="text-white hover:text-[#E50000]">
                {playing ? <Pause size={22} /> : <Play size={22} fill="white" />}
              </button>
              <span className="text-xs text-[#CCCCCC]">
                {formatTime(current)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {youtubeSource && (
                <button
                  type="button"
                  onClick={() => setMode('youtube')}
                  className="text-xs text-[#999999] hover:text-white">
                  Трейлер
                </button>
              )}
              <button type="button" onClick={toggleMute} className="text-white">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="hidden w-20 sm:block accent-[#E50000]"
              />
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-white hover:text-[#E50000]">
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
