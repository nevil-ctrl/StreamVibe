'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Tv,
  Film,
} from 'lucide-react';
import type { PlaybackSource } from '@/services/tmdb-videos.service';
import { enterFullscreen, exitFullscreen } from '@/lib/player-utils';

interface VideoPlayerProps {
  title: string;
  sources: PlaybackSource[];
  initialProgress?: number;
  onProgress?: (current: number, duration: number) => void;
  tmdbId: string;
  imdbId?: string | null;
  season?: number;
  episode?: number;
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
  tmdbId,
  imdbId,
  season,
  episode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveRef = useRef(0);

  const mp4Source = sources?.find((s) => s.kind === 'mp4');
  const youtubeSource = sources?.find((s) => s.kind === 'youtube');

  const [mode, setMode] = useState<'player' | 'mp4' | 'youtube'>(
    tmdbId || imdbId ? 'player' : mp4Source ? 'mp4' : 'youtube',
  );
  const [playerLang, setPlayerLang] = useState<'ru' | 'en'>('ru');
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
    }, 2500);
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

  const togglePlay = useCallback(() => {
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
  }, [mode, onProgress, resetHideTimer]);

  const skip = useCallback(
    (amount: number) => {
      const video = videoRef.current;
      if (!video || mode !== 'mp4') return;
      let target = video.currentTime + amount;
      if (target < 0) target = 0;
      if (target > video.duration) target = video.duration;
      video.currentTime = target;
      setCurrent(target);
      resetHideTimer();
    },
    [mode, resetHideTimer],
  );

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || mode !== 'mp4') return;
    video.currentTime = value;
    setCurrent(value);
    resetHideTimer();
  };

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        enterFullscreen(el);
        setFullscreen(true);
      } else {
        exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      // Fullscreen may be blocked by browser policy
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'mp4') return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'f':
          e.preventDefault();
          void toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowup':
          e.preventDefault();
          if (videoRef.current) {
            changeVolume(Math.min(videoRef.current.volume + 0.05, 1));
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (videoRef.current) {
            changeVolume(Math.max(videoRef.current.volume - 0.05, 0));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, togglePlay, skip, toggleFullscreen, toggleMute, changeVolume]);

  const getEmbedUrl = () => {
    if (playerLang === 'ru') {
      // vidsrc.me — рабочий провайдер с поддержкой TMDB ID (kinobox.tv недоступен с 2026)
      if (season !== undefined && episode !== undefined) {
        return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    } else {
      // 2embed.cc — надёжный EN провайдер
      if (season !== undefined && episode !== undefined) {
        return `https://www.2embed.cc/embedtv/${imdbId || tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${imdbId || tmdbId}`;
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141414] border border-[#262628] p-2.5 rounded-xl">
        <div className="flex flex-wrap gap-2">
          {mp4Source && (
            <button
              type="button"
              onClick={() => setMode('mp4')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                mode === 'mp4'
                  ? 'bg-[#E50000] border-[#E50000] text-white shadow-lg shadow-[#E50000]/20'
                  : 'bg-[#1F1F1F] border-[#262628] text-[#B3B3B3] hover:text-white hover:border-[#4C4C4C]'
              }`}>
              <Film size={14} />
              Основной плеер
            </button>
          )}

          {(tmdbId || imdbId) && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('player');
                  setPlayerLang('ru');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  mode === 'player' && playerLang === 'ru'
                    ? 'bg-[#E50000] border-[#E50000] text-white shadow-lg shadow-[#E50000]/20'
                    : 'bg-[#1F1F1F] border-[#262628] text-[#B3B3B3] hover:text-white hover:border-[#4C4C4C]'
                }`}>
                <Tv size={14} />
                Русская озвучка
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('player');
                  setPlayerLang('en');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  mode === 'player' && playerLang === 'en'
                    ? 'bg-[#E50000] border-[#E50000] text-white shadow-lg shadow-[#E50000]/20'
                    : 'bg-[#1F1F1F] border-[#262628] text-[#B3B3B3] hover:text-white hover:border-[#4C4C4C]'
                }`}>
                <Tv size={14} />
                English / Subs
              </button>
            </>
          )}
        </div>

        {youtubeSource && (
          <button
            type="button"
            onClick={() => setMode('youtube')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
              mode === 'youtube'
                ? 'bg-[#E50000] border-[#E50000] text-white shadow-lg shadow-[#E50000]/20'
                : 'bg-[#1F1F1F] border-[#262628] text-[#B3B3B3] hover:text-white hover:border-[#4C4C4C]'
            }`}>
            Смотреть трейлер
          </button>
        )}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-[#262628]/50 select-none">
        {mode === 'player' && (tmdbId || imdbId) && (
          <iframe
            title={title}
            src={getEmbedUrl()}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {mode === 'youtube' && youtubeSource && (
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${youtubeSource.key}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {mode === 'mp4' && (
          <div
            ref={containerRef}
            className="w-full h-full relative group/player"
            onMouseMove={resetHideTimer}
            onMouseLeave={() => playing && setShowControls(false)}>
            <video
              ref={videoRef}
              src={mp4Source?.url}
              className="h-full w-full object-contain cursor-pointer"
              playsInline
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
            />

            <div
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none bg-black/20 backdrop-blur-[2px] ${
                !playing
                  ? 'opacity-100'
                  : 'opacity-0 scale-110 group-hover/player:opacity-100 group-hover/player:scale-100'
              }`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E50000] text-white shadow-xl shadow-[#E50000]/40 pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95">
                {playing ? (
                  <Pause size={28} fill="white" />
                ) : (
                  <Play size={28} fill="white" className="ml-1" />
                )}
              </div>
            </div>

            <div
              className={`absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent pt-28 pb-5 px-6 transition-all duration-300 ${
                showControls
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-3 pointer-events-none'
              }`}>
              <div className="w-full pointer-events-auto">
                <div className="mb-3.5 hidden sm:block">
                  <h2 className="text-sm font-medium text-white/90 tracking-wide truncate">
                    {title}
                  </h2>
                </div>

                <div className="group/track relative mb-4 flex h-2 w-full cursor-pointer items-center">
                  <div className="absolute h-1 w-full rounded-full bg-white/10 transition-all duration-200 group-hover/track:h-1.5" />
                  <div
                    className="absolute h-1 rounded-full bg-[#E50000] transition-all duration-200 group-hover/track:h-1.5"
                    style={{ width: `${(current / (duration || 100)) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={current}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-x-0 w-full h-4 opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute h-3 w-3 scale-0 rounded-full bg-white border border-[#E50000] shadow-md transition-transform duration-150 pointer-events-none group-hover/track:scale-100"
                    style={{
                      left: `calc(${
                        (current / (duration || 100)) * 100
                      }% - 6px)`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="text-white/90 transition-colors duration-200 hover:text-[#E50000] active:scale-90">
                      {playing ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => skip(-10)}
                      className="text-white/90 transition-colors duration-200 hover:text-[#E50000] active:scale-90">
                      <RotateCcw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => skip(10)}
                      className="text-white/90 transition-colors duration-200 hover:text-[#E50000] active:scale-90">
                      <RotateCw size={16} />
                    </button>

                    <div className="group/volume flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-white/90 transition-colors duration-200 hover:text-[#E50000]">
                        {muted || volume === 0 ? (
                          <VolumeX size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </button>
                      <div className="w-0 overflow-hidden transition-all duration-300 group-hover/volume:w-20">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={muted ? 0 : volume}
                          onChange={(e) => changeVolume(Number(e.target.value))}
                          className="h-1 w-full appearance-none rounded-full bg-white/20 accent-[#E50000] cursor-pointer"
                        />
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-[#A6A6A6] tabular-nums bg-[#141414]/80 px-2.5 py-1 rounded-lg border border-[#262628]/60">
                      {formatTime(current)}{' '}
                      <span className="text-white/10 mx-1">/</span>{' '}
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="text-white/90 transition-colors duration-200 hover:text-[#E50000] active:scale-90">
                      {fullscreen ? (
                        <Minimize size={18} />
                      ) : (
                        <Maximize size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
