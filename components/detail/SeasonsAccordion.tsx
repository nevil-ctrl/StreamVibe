'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Play, Loader2 } from 'lucide-react';
import type { TMDBSeasonSummary, TMDBEpisode } from '@/types/media-detail';
import { tmdbStill } from '@/lib/tmdb-images';
import { startWatchingShow } from '@/app/actions/watch.actions';

interface SeasonsAccordionProps {
  showId: number;
  showName: string;
  posterPath: string | null;
  seasons: TMDBSeasonSummary[];
}

function formatRuntime(minutes: number | null) {
  if (!minutes) return '—';
  return `${minutes} min`;
}

export default function SeasonsAccordion({
  showId,
  showName,
  posterPath,
  seasons,
}: SeasonsAccordionProps) {
  const filtered = seasons
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const [openSeason, setOpenSeason] = useState<number | null>(
    filtered[0]?.season_number ?? null,
  );
  const [episodes, setEpisodes] = useState<Record<number, TMDBEpisode[]>>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);

  const toggleSeason = async (seasonNumber: number) => {
    if (openSeason === seasonNumber) {
      setOpenSeason(null);
      return;
    }

    setOpenSeason(seasonNumber);

    if (episodes[seasonNumber]) return;

    setLoadingSeason(seasonNumber);
    try {
      const res = await fetch(`/api/tv/${showId}/season/${seasonNumber}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEpisodes((prev) => ({
        ...prev,
        [seasonNumber]: data.episodes ?? [],
      }));
    } catch {
      setEpisodes((prev) => ({ ...prev, [seasonNumber]: [] }));
    } finally {
      setLoadingSeason(null);
    }
  };

  if (filtered.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 md:p-8">
      <h2 className="mb-5 text-xl font-bold text-white">Seasons and Episodes</h2>

      <div className="space-y-3">
        {filtered.map((season) => {
          const isOpen = openSeason === season.season_number;
          const seasonEpisodes = episodes[season.season_number] ?? [];
          const isLoading = loadingSeason === season.season_number;

          return (
            <div
              key={season.id}
              className="overflow-hidden rounded-xl border border-[#262628] bg-[#141414]">
              <button
                type="button"
                onClick={() => toggleSeason(season.season_number)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition hover:bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-white">
                    Season {String(season.season_number).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-[#999999]">
                    {season.episode_count} episodes
                  </p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-[#999999] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[#262628] px-3 py-3 md:px-5">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[#999999]">
                      <Loader2 size={20} className="animate-spin text-[#E50000]" />
                      Загрузка эпизодов...
                    </div>
                  ) : seasonEpisodes.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[#999999]">
                      Эпизоды недоступны
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {seasonEpisodes.map((ep) => {
                        const still = tmdbStill(ep.still_path);
                        return (
                          <div
                            key={ep.id}
                            className="flex gap-4 rounded-xl border border-[#262628] bg-[#1A1A1A] p-3 transition hover:border-[#E50000]/40">
                            <span className="w-6 shrink-0 pt-1 text-sm font-medium text-[#666666]">
                              {String(ep.episode_number).padStart(2, '0')}
                            </span>

                            <div className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-lg bg-[#262628]">
                              {still ? (
                                <Image
                                  src={still}
                                  alt={ep.name}
                                  fill
                                  sizes="128px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-[#666666]">
                                  No image
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  startWatchingShow({
                                    id: showId,
                                    name: showName,
                                    poster_path: posterPath,
                                    episodeId: String(ep.id),
                                    season: season.season_number,
                                    episode: ep.episode_number,
                                  })
                                }
                                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                                <Play
                                  size={20}
                                  fill="white"
                                  className="text-white"
                                />
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium text-white">
                                  {ep.name}
                                </p>
                                <span className="text-xs text-[#999999]">
                                  {formatRuntime(ep.runtime)}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-xs leading-relaxed text-[#999999]">
                                {ep.overview || 'Описание эпизода отсутствует.'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
