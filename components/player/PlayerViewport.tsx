'use client';

import { Play } from 'lucide-react';
import PlayerSkeleton from '@/components/player/PlayerSkeleton';

interface PlayerViewportProps {
  title: string;
  providerUrl: string | null;
  playerReady: boolean;
  needsInteraction: boolean;
  iframeKey: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
  onIframeError: () => void;
  onManualPlay: () => void;
}

export default function PlayerViewport({
  title,
  providerUrl,
  playerReady,
  needsInteraction,
  iframeKey,
  iframeRef,
  onIframeLoad,
  onIframeError,
  onManualPlay,
}: PlayerViewportProps) {
  return (
    <div className="flex-1 relative bg-black min-h-0 w-full">
      <div className="absolute inset-0 w-full aspect-video max-h-full mx-auto">
        {!providerUrl ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#999] bg-black">
            Нет доступных источников
          </div>
        ) : (
          <>
            {!playerReady && <PlayerSkeleton />}

            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={providerUrl}
              className="absolute inset-0 w-full h-full border-0 bg-black"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              onLoad={onIframeLoad}
              onError={onIframeError}
              title={title}
            />

            {needsInteraction && playerReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                <button
                  type="button"
                  onClick={onManualPlay}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E50000] text-white shadow-xl shadow-[#E50000]/40 transition-transform hover:scale-110 active:scale-95"
                  aria-label="Воспроизвести">
                  <Play size={28} fill="white" className="ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
