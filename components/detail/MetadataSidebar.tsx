import {
  Calendar,
  Globe,
  Star,
  LayoutGrid,
  Clapperboard,
  Music2,
} from 'lucide-react';
import Image from 'next/image';
import type { TMDBGenre, TMDBCrewMember } from '@/types/media-detail';
import { tmdbProfile } from '@/lib/tmdb-images';
import { formatRating, tmdbToFiveScale } from '@/lib/rating';

interface MetadataSidebarProps {
  releaseYear: string | null;
  languages: string[];
  rating: number;
  voteCount: number;
  genres: TMDBGenre[];
  director?: TMDBCrewMember;
  composer?: TMDBCrewMember;
  watchersCount?: number;
}

function PersonCard({
  label,
  person,
}: {
  label: string;
  person?: TMDBCrewMember;
}) {
  if (!person) return null;
  const photo = tmdbProfile(person.profile_path);

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
        {label === 'Director' ? (
          <Clapperboard size={16} className="text-[#999999]" />
        ) : (
          <Music2 size={16} className="text-[#999999]" />
        )}
        {label}
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-[#262628] bg-[#141414] p-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#262628]">
          {photo ? (
            <Image
              src={photo}
              alt={person.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#666666]">
              N/A
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{person.name}</p>
          <p className="text-xs text-[#999999]">From TMDB</p>
        </div>
      </div>
    </div>
  );
}

export default function MetadataSidebar({
  releaseYear,
  languages,
  rating,
  voteCount,
  genres,
  director,
  composer,
  watchersCount = 0,
}: MetadataSidebarProps) {
  const ratingFive = rating ? tmdbToFiveScale(rating) : 0;
  const ratingText = ratingFive > 0 ? formatRating(ratingFive) : '—';

  return (
    <aside className="h-fit rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6">
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[#999999]">
            <Calendar size={16} />
            Released Year
          </div>
          <p className="text-lg font-semibold text-white">
            {releaseYear ?? '—'}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#999999]">
            <Globe size={16} />
            Available Languages
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-md border border-[#262628] bg-[#141414] px-3 py-1 text-xs text-[#BFBFBF]">
                  {lang}
                </span>
              ))
            ) : (
              <span className="text-sm text-[#666666]">—</span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#999999]">
            <Star size={16} />
            Ratings
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#262628] bg-[#141414] p-4">
              <p className="mb-1 text-xs text-[#999999]">IMDb</p>
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-[#E50000]" fill="#E50000" />
                <span className="text-lg font-bold text-white">
                  {ratingText}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#666666]">
                {voteCount.toLocaleString()} votes
              </p>
            </div>
            <div className="rounded-xl border border-[#262628] bg-[#141414] p-4">
              <p className="mb-1 text-xs text-[#999999]">StreamVibe</p>
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-[#E50000]" fill="#E50000" />
                <span className="text-lg font-bold text-white">
                  {ratingText}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#666666]">
                {watchersCount > 0
                  ? `${watchersCount} watched`
                  : 'Be the first'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#999999]">
            <LayoutGrid size={16} />
            Genres
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <span
                key={g.id}
                className="rounded-md border border-[#262628] bg-[#141414] px-3 py-1 text-xs text-[#BFBFBF]">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <PersonCard label="Director" person={director} />
      <PersonCard label="Music" person={composer} />
    </aside>
  );
}
