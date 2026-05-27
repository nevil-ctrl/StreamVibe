'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Play,
  Plus,
  ThumbsUp,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
} from 'lucide-react';
import { TMDB_IMAGE_URL, TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from '@/lib/tmdb';

interface IMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface ICategory {
  id: string | number;
  name: string;
  items: IMedia[];
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="text-white text-center py-20 bg-[#141414] min-h-screen">
          Синхронизация интерфейса...
        </div>
      }>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [movieHero, setMovieHero] = useState<IMedia[]>([]);
  const [currentMovieHeroIndex, setCurrentMovieHeroIndex] = useState(0);

  const [showHero, setShowHero] = useState<IMedia[]>([]);
  const [currentShowHeroIndex, setCurrentShowHeroIndex] = useState(0);

  const [movieSections, setMovieSections] = useState<ICategory[]>([]);
  const [showSections, setShowSections] = useState<ICategory[]>([]);

  const fetchFromTMDB = async (path: string) => {
    try {
      const res = await fetch(`${TMDB_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.error('Ошибка запроса:', e);
      return [];
    }
  };

  useEffect(() => {
    async function loadAllContent() {
      setLoading(true);

      const [
        trendingMovies,
        popularMovies,
        topRatedMovies,
        upcomingMovies,
        nowPlayingMovies,
        trendingShows,
        popularShows,
        topRatedShows,
        airingTodayShows,
        onTheAirShows,
      ] = await Promise.all([
        fetchFromTMDB('/trending/movie/week'),
        fetchFromTMDB('/movie/popular'),
        fetchFromTMDB('/movie/top_rated'),
        fetchFromTMDB('/movie/upcoming'),
        fetchFromTMDB('/movie/now_playing'),
        fetchFromTMDB('/trending/tv/week'),
        fetchFromTMDB('/tv/popular'),
        fetchFromTMDB('/tv/top_rated'),
        fetchFromTMDB('/tv/airing_today'),
        fetchFromTMDB('/tv/on_the_air'),
      ]);

      setMovieHero(trendingMovies.slice(0, 5));
      setShowHero(trendingShows.slice(0, 5));

      setMovieSections([
        { id: 'genres_movie', name: 'Our Genres', items: popularMovies },
        {
          id: 'top10_movie',
          name: 'Popular Top 10 In Genres',
          items: topRatedMovies,
        },
        { id: 'trending_movie', name: 'Trending Now', items: trendingMovies },
        { id: 'new_movie', name: 'New Releases', items: upcomingMovies },
        {
          id: 'must_movie',
          name: 'Must - Watch Movies',
          items: nowPlayingMovies,
        },
      ]);

      setShowSections([
        { id: 'genres_tv', name: 'Our Genres', items: popularShows },
        {
          id: 'top10_tv',
          name: 'Popular Top 10 In Genres',
          items: topRatedShows,
        },
        { id: 'trending_tv', name: 'Trending Now', items: trendingShows },
        { id: 'new_tv', name: 'New Releases', items: airingTodayShows },
        { id: 'must_tv', name: 'Must - Watch Shows', items: onTheAirShows },
      ]);

      setLoading(false);
    }

    loadAllContent();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#141414] min-h-screen text-white flex items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-[#999999]">
          Loading StreamVibe Content...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-32 select-none">
      {/* ── MOVIES HERO ── */}
      <HeroSlider
        items={movieHero}
        currentIndex={currentMovieHeroIndex}
        onPrev={() =>
          setCurrentMovieHeroIndex((p) =>
            p === 0 ? movieHero.length - 1 : p - 1,
          )
        }
        onNext={() =>
          setCurrentMovieHeroIndex((p) =>
            p === movieHero.length - 1 ? 0 : p + 1,
          )
        }
        onDot={setCurrentMovieHeroIndex}
        type="movie"
      />

      {/* ── MOVIES SECTIONS ── */}
      <div
        className="container mx-auto px-4 md:px-12"
        style={{ marginTop: '180px' }}>
        <div className="mb-10">
          <span className="px-3 py-1 bg-[#E50000] text-white text-xs font-bold rounded uppercase tracking-wider">
            Movies
          </span>
        </div>

        {movieSections.map((section) => (
          <HorizontalTrack
            key={section.id}
            title={section.name}
            items={section.items}
            type="movie"
          />
        ))}
      </div>

      {/* ── SHOWS SECTIONS ── */}
      <div
        className="container mx-auto px-4 md:px-12"
        style={{ marginTop: '150px' }}>
        <div className="mb-10">
          <span className="px-3 py-1 bg-[#E50000] text-white text-xs font-bold rounded uppercase tracking-wider">
            Shows
          </span>
        </div>

        {showSections.map((section) => (
          <HorizontalTrack
            key={section.id}
            title={section.name}
            items={section.items}
            type="tv"
          />
        ))}
      </div>
    </div>
  );
} // ← ВОТ ЭТО ЧАСТО УДАЛЯЮТ СЛУЧАЙНО
/* ─────────────────────────────────────────
   Hero Slider — переиспользуется для фильмов и сериалов
───────────────────────────────────────── */
function HeroSlider({
  items,
  currentIndex,
  onPrev,
  onNext,
  onDot,
  type,
}: {
  items: IMedia[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onDot: (i: number) => void;
  type: 'movie' | 'tv';
}) {
  const router = useRouter();
  const current = items[currentIndex];
  if (!current) return null;

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] overflow-hidden px-4 md:px-12 pt-6">
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#262628] bg-[#1A1A1A]">
        <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-r from-[#141414]/70 via-transparent to-transparent z-10" />

        <Image
          src={`${TMDB_IMAGE_URL.replace('w500', 'original')}${current.backdrop_path}`}
          alt={current.title || current.name || 'Hero'}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-10 px-6 md:px-16 text-center max-w-4xl mx-auto">
          <h1 className="text-[26px] sm:text-[34px] md:text-[42px] font-bold text-white mb-3 drop-shadow-md tracking-tight">
            {current.title || current.name}
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#e4e4e7] max-w-2xl line-clamp-2 mb-6 opacity-85 leading-relaxed">
            {current.overview || 'Описание подготавливается бэкенд-сервером.'}
          </p>

          <div className="flex items-center justify-between w-full max-w-xl gap-4 mt-2">
            <button
              onClick={onPrev}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#141414]/80 border border-[#262628] hover:bg-[#E50000] hover:border-[#E50000] transition cursor-pointer">
              <ArrowLeft size={16} className="text-white" />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  router.push(
                    type === 'movie'
                      ? `/movies/${current.id}`
                      : `/shows/${current.id}`,
                  )
                }
                className="flex items-center gap-2 px-6 py-3 bg-[#E50000] hover:bg-red-700 font-semibold rounded-lg text-sm transition duration-200 cursor-pointer">
                <Play size={16} fill="currentColor" /> Play Now
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
                <Plus size={18} />
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
                <ThumbsUp size={16} />
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
                <Volume2 size={16} />
              </button>
            </div>

            <button
              onClick={onNext}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#141414]/80 border border-[#262628] hover:bg-[#E50000] hover:border-[#E50000] transition cursor-pointer">
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-6">
            {items.map((_, idx) => (
              <span
                key={idx}
                onClick={() => onDot(idx)}
                className={`h-[4px] rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#E50000]' : 'w-3 bg-[#333]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalTrack({
  title,
  items,
  type,
}: {
  title: string;
  items: IMedia[];
  type: 'movie' | 'tv';
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = 220;
  const GAP = 20;
  const VISIBLE = 5;

  const loopedItems = [...items, ...items, ...items];
  const originalLength = items.length;
  const singleSetWidth = (CARD_WIDTH + GAP) * originalLength;

  useEffect(() => {
    const el = trackRef.current;
    if (el && originalLength > 0) {
      el.scrollLeft = singleSetWidth;
    }
  }, [singleSetWidth, originalLength]);

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = (CARD_WIDTH + GAP) * VISIBLE;
    el.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || originalLength === 0) return;

    let currentScroll = el.scrollLeft;

    if (currentScroll >= singleSetWidth * 2) {
      el.scrollLeft = currentScroll - singleSetWidth;
      currentScroll = el.scrollLeft;
    } else if (currentScroll <= singleSetWidth - (CARD_WIDTH + GAP) * VISIBLE) {
      el.scrollLeft = currentScroll + singleSetWidth;
      currentScroll = el.scrollLeft;
    }

    const relativeScroll = currentScroll % singleSetWidth;
    const itemIndex = Math.round(relativeScroll / (CARD_WIDTH + GAP));
    const pageIndex =
      Math.floor(itemIndex / VISIBLE) % Math.ceil(originalLength / VISIBLE);

    setActiveIndex(pageIndex);
  };

  if (items.length === 0) return null;
  const totalSlides = Math.ceil(originalLength / VISIBLE);

  return (
    <div className="mb-20 last:mb-0">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[20px] sm:text-[24px] font-bold text-white tracking-tight">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] transition cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span
                key={i}
                className={`h-0.75 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-[#E50000]' : 'w-4 bg-[#333]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] transition cursor-pointer">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-5 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}>
        {loopedItems.map((item, index) => {
          const generatedMinutes = (item.id % 70) + 85;
          const hours = Math.floor(generatedMinutes / 60);
          const mins = generatedMinutes % 60;
          const durationText =
            type === 'movie'
              ? `${hours}h ${mins}m`
              : `${(item.id % 4) + 2} Seasons`;

          return (
            <article
              key={`${item.id}-${index}`}
                onClick={() =>
                  router.push(
                    type === 'movie'
                      ? `/movies/${item.id}`
                      : `/shows/${item.id}`,
                  )
                }
              style={{
                minWidth: `${CARD_WIDTH}px`,
                maxWidth: `${CARD_WIDTH}px`,
              }}
              className="rounded-xl border border-[#262628] bg-[#1A1A1A] p-3 hover:border-[#E50000] transition group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="relative aspect-2/3 overflow-hidden rounded-lg mb-4 bg-[#262628]">
                  <Image
                    src={
                      item.poster_path
                        ? `${TMDB_IMAGE_URL}${item.poster_path}`
                        : '/no-poster.png'
                    }
                    alt={item.title || item.name || 'Poster'}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                    draggable={false}
                  />
                  {title.includes('Top 10') && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#E50000] text-[10px] font-bold rounded text-white uppercase tracking-wider shadow-md">
                      Top 10
                    </span>
                  )}
                </div>
                <h4 className="text-[15px] font-medium text-white truncate px-1 mb-2.5">
                  {item.title || item.name}
                </h4>
                <div className="flex items-center justify-between px-1 text-[12px] text-[#999999] font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[#666666]" />
                    <span>{durationText}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#141414] border border-[#262628] px-2 py-0.5 rounded-full text-white text-[11px]">
                    <Star size={11} className="text-[#FFAD4B]" fill="#FFAD4B" />
                    <span>
                      {item.vote_average ? item.vote_average.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
