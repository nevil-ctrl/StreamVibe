'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface PlayerSectionProps {
  tmdbId: number;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

import { ALL_PROVIDERS } from '@/lib/providers';

const PLAYERS = ALL_PROVIDERS.map((provider) => ({
  id: provider.id,
  label: provider.label,
  getUrl: (id: number, type: string) =>
    type === 'movie'
      ? provider.getMovieUrl(String(id))
      : provider.getTvUrl(String(id), 1, 1),
}));

export default function PlayerSection({
  tmdbId,
  title,
  type,
}: PlayerSectionProps) {
  const [open, setOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState(PLAYERS[0].id);

  const current = PLAYERS.find((p) => p.id === activePlayer)!;
  const embedUrl = current.getUrl(tmdbId, type);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full px-6 py-4 bg-[#E50000] hover:bg-[#FF0000] rounded-xl text-white font-semibold text-lg transition cursor-pointer">
        <Play size={22} fill="currentColor" />
        Смотреть онлайн
      </button>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#262628] bg-[#0F0F0F]">
      {/* Шапка плеера */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262628]">
        <div className="flex items-center gap-2">
          {PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlayer(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activePlayer === p.id
                  ? 'bg-[#E50000] text-white'
                  : 'bg-[#1A1A1A] text-[#999] hover:text-white border border-[#262628]'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] transition cursor-pointer">
          <X size={14} className="text-[#999]" />
        </button>
      </div>

      {/* Iframe */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={title}
        />
      </div>

      <p className="text-[11px] text-[#666] px-4 py-2">
        Если один источник не работает — попробуй другой
      </p>
    </div>
  );
}
