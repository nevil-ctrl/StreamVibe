'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
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
import { TMDB_IMAGE_URL } from '@/lib/tmdb';

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
  const [loading, setLoading] = useState(true);
  const [movieHero, setMovieHero] = useState<IMedia[]>([]);
  const [currentMovieHeroIndex, setCurrentMovieHeroIndex] = useState(0);
  const [showHero, setShowHero] = useState<IMedia[]>([]);
  const [currentShowHeroIndex, setCurrentShowHeroIndex] = useState(0);
  const [movieSections, setMovieSections] = useState<ICategory[]>([]);
  const [showSections, setShowSections] = useState<ICategory[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'shows'>('movies');

  const fetchFromTMDB = async (path: string) => {
    try {
      const encodedPath = encodeURIComponent(path);
      const res = await fetch(`/api/tmdb?path=${encodedPath}`);
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
        { id: 'trending_tv', name: 'Trending Shows Now', items: trendingShows },
        { id: 'new_tv', name: 'New Released Shows', items: airingTodayShows },
        { id: 'must_tv', name: 'Must - Watch Shows', items: onTheAirShows },
      ]);

      setLoading(false);
    }
    loadAllContent();
  }, []);

  const handlePrev = useCallback(() => {
    if (activeTab === 'movies') {
      setCurrentMovieHeroIndex((p) => (p === 0 ? movieHero.length - 1 : p - 1));
    } else {
      setCurrentShowHeroIndex((p) => (p === 0 ? showHero.length - 1 : p - 1));
    }
  }, [activeTab, movieHero.length, showHero.length]);

  const handleNext = useCallback(() => {
    if (activeTab === 'movies') {
      setCurrentMovieHeroIndex((p) => (p === movieHero.length - 1 ? 0 : p + 1));
    } else {
      setCurrentShowHeroIndex((p) => (p === showHero.length - 1 ? 0 : p + 1));
    }
  }, [activeTab, movieHero.length, showHero.length]);

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
      <HeroSlider
        items={activeTab === 'movies' ? movieHero : showHero}
        currentIndex={
          activeTab === 'movies' ? currentMovieHeroIndex : currentShowHeroIndex
        }
        onPrev={handlePrev}
        onNext={handleNext}
        onDot={
          activeTab === 'movies'
            ? setCurrentMovieHeroIndex
            : setCurrentShowHeroIndex
        }
        type={activeTab === 'movies' ? 'movie' : 'tv'}
      />

      {/* Toggle mobile */}
      <div className="md:hidden px-4 mt-6 flex justify-center">
        <div className="flex bg-[#0F0F0F] rounded-lg p-1.5 border border-[#1A1A1A] w-full max-w-[400px]">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'movies'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#999999] hover:text-white'
            }`}>
            Movies
          </button>
          <button
            onClick={() => setActiveTab('shows')}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'shows'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#999999] hover:text-white'
            }`}>
            Shows
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="pb-16 md:pb-20">
        <div
          className={`container mx-auto px-4 md:px-12 mt-8 md:mt-12 ${activeTab === 'movies' ? 'block' : 'hidden md:block'}`}>
          <div className="hidden md:block mb-8">
            <span className="px-3 py-1 bg-[#E50000] text-white text-[10px] md:text-xs font-bold rounded uppercase tracking-wider">
              Movies
            </span>
          </div>
          {movieSections.map((section) => (
            <HorizontalTrack
              key={section.id}
              title={section.name}
              items={section.items}
              type="movie"
              sectionId={String(section.id)}
            />
          ))}
        </div>

        <div
          className={`container mx-auto px-4 md:px-12 mt-8 md:mt-12 ${activeTab === 'shows' ? 'block' : 'hidden md:block'}`}>
          <div className="hidden md:block mb-8">
            <span className="px-3 py-1 bg-[#E50000] text-white text-[10px] md:text-xs font-bold rounded uppercase tracking-wider">
              Shows
            </span>
          </div>
          {showSections.map((section) => (
            <HorizontalTrack
              key={section.id}
              title={section.name}
              items={section.items}
              type="tv"
              sectionId={String(section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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
  onDot: (index: number) => void;
  type: 'movie' | 'tv';
}) {
  const router = useRouter();
  const current = items[currentIndex];

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(onNext, 5000);
    return () => clearInterval(timer);
  }, [items.length, onNext]);

  if (!current) return null;

  return (
    <div className="px-4 md:px-12 pt-4 md:pt-6">
      <div className="relative w-full h-[460px] md:h-[600px] rounded-2xl overflow-hidden border border-[#262628]">
        <Image
          src={`${TMDB_IMAGE_URL.replace('w500', 'original')}${current.backdrop_path}`}
          alt={current.title || current.name || 'Hero'}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-4 md:px-6 pb-6 md:pb-12">
          <h1 className="text-[24px] md:text-[42px] font-bold text-white mb-2 md:mb-3 drop-shadow-lg tracking-tight leading-tight">
            {current.title || current.name}
          </h1>
          <p className="text-[12px] md:text-[15px] text-[#cccccc] max-w-3xl line-clamp-2 mb-4 md:mb-7 leading-relaxed drop-shadow-md">
            {current.overview}
          </p>

          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() =>
                router.push(
                  type === 'movie'
                    ? `/movies/${current.id}`
                    : `/shows/${current.id}`,
                )
              }
              className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 bg-[#E50000] hover:bg-red-700 font-semibold rounded-lg text-[14px] md:text-[15px] transition text-white cursor-pointer shadow-lg shadow-[#E50000]/20">
              <Play size={14} fill="currentColor" /> Play Now
            </button>
            <button className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg bg-[#0F0F0F]/80 border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
              <Plus size={17} className="text-white" />
            </button>
            <button className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg bg-[#0F0F0F]/80 border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
              <ThumbsUp size={15} className="text-white" />
            </button>
            <button className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg bg-[#0F0F0F]/80 border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer">
              <Volume2 size={15} className="text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-4 md:mt-8">
            {items.map((_, idx) => (
              <span
                key={idx}
                onClick={() => onDot(idx)}
                className={`h-[4px] rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#E50000]' : 'w-4 bg-[#333333]'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onPrev}
          className="absolute left-3 md:left-8 bottom-6 md:bottom-10 z-30 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-[#0F0F0F] border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer opacity-80 hover:opacity-100">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <button
          onClick={onNext}
          className="absolute right-3 md:right-8 bottom-6 md:bottom-10 z-30 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-[#0F0F0F] border border-[#262628] hover:bg-[#1A1A1A] transition cursor-pointer opacity-80 hover:opacity-100">
          <ArrowRight size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function HorizontalTrack({
  title,
  items,
  type,
  sectionId,
}: {
  title: string;
  items: IMedia[];
  type: 'movie' | 'tv';
  sectionId: string;
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
    <div className="mb-10 md:mb-20 last:mb-0">
      <div className="flex items-center justify-between mb-4 md:mb-8 gap-4">
        <h3
          onClick={() =>
            router.push(
              `/browse/genre?type=${type}&status=${sectionId}&name=${encodeURIComponent(title)}`,
            )
          }
          className="text-[16px] sm:text-[24px] font-bold text-white tracking-tight cursor-pointer hover:text-[#E50000] transition">
          {title}
        </h3>
        <div className="hidden md:flex items-center gap-3 shrink-0">
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
        className="flex gap-4 md:gap-5 overflow-x-auto pb-4"
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

      <div className="flex md:hidden items-center justify-center gap-1.5 mt-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-6 bg-[#E50000]' : 'w-2 bg-[#333]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
