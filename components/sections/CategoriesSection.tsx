'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';

type Movie = { id: number; poster_path: string; title: string };
type Category = { id: number | string; name: string; movies: Movie[] };

interface CategoriesSectionProps {
  categories: Category[];
  type: 'movie' | 'tv';
}

const CARD_WIDTH = 260;
const GAP = 20;
const VISIBLE = 5;

export default function CategoriesSection({
  categories,
  type,
}: CategoriesSectionProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isResetting = useRef(false);
  const isButtonScrolling = useRef(false); 
  const originalLength = categories.length;
  const loopedCategories = [...categories, ...categories, ...categories];
  const singleSetWidth = (CARD_WIDTH + GAP) * originalLength;

  // Рефы для драга мышью
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const walked = useRef(0);

  // Первоначальный прыжок в центр
  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft = singleSetWidth;
      el.style.scrollBehavior = 'smooth';
    }
  }, [singleSetWidth]);

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el || isResetting.current) return;

    const amount = (CARD_WIDTH + GAP) * VISIBLE;

    isButtonScrolling.current = true;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'smooth';

    el.scrollBy({ left: dir === 'right' ? amount : -amount });

    setTimeout(() => {
      if (el) {
        el.style.scrollSnapType = 'x mandatory';
        isButtonScrolling.current = false;
      }
    }, 400); 
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    let currentScroll = el.scrollLeft;

    if (currentScroll >= singleSetWidth * 2) {
      isResetting.current = true;
      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      el.scrollLeft = currentScroll - singleSetWidth;

      if (!isDown.current && !isButtonScrolling.current) {
        el.style.scrollBehavior = 'smooth';
        el.style.scrollSnapType = 'x mandatory';
      }
      isResetting.current = false;
    } else if (currentScroll <= singleSetWidth - (CARD_WIDTH + GAP) * VISIBLE) {
      isResetting.current = true;
      el.style.scrollBehavior = 'auto';
      el.style.scrollSnapType = 'none';
      el.scrollLeft = currentScroll + singleSetWidth;

      if (!isDown.current && !isButtonScrolling.current) {
        el.style.scrollBehavior = 'smooth';
        el.style.scrollSnapType = 'x mandatory';
      }
      isResetting.current = false;
    }

    if (isResetting.current) return;

    const relativeScroll = el.scrollLeft % singleSetWidth;
    const itemIndex = Math.round(relativeScroll / (CARD_WIDTH + GAP));
    const pageIndex =
      Math.floor(itemIndex / VISIBLE) % Math.ceil(originalLength / VISIBLE);

    if (!isNaN(pageIndex)) {
      setActiveIndex(pageIndex);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    isDown.current = true;
    walked.current = 0;

    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';

    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const onMouseLeave = () => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = trackRef.current;
    if (el) {
      el.style.scrollBehavior = 'smooth';
      el.style.scrollSnapType = 'x mandatory';
    }
  };

  const onMouseUp = () => {
    isDown.current = false;
    const el = trackRef.current;
    if (el) {
      el.style.scrollBehavior = 'smooth';
      el.style.scrollSnapType = 'x mandatory';
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    const el = trackRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    walked.current = Math.abs(walk);
    el.scrollLeft = scrollLeft.current - walk;
  };

const handleCategoryClick = (id: number | string, name: string) => {
  if (walked.current > 5) return;
  if (typeof id === 'string') {
    router.push(
      `/browse/genre?type=${type}&status=${id}&name=${encodeURIComponent(name)}`,
    );
  } else {
    router.push(
      `/browse/genre?type=${type}&genre=${id}&name=${encodeURIComponent(name)}`,
    );
  }
};

  const totalSlides = Math.ceil(originalLength / VISIBLE);

  return (
    <section className="container  select-none">
      <div className="flex items-start justify-between mb-10">
        <div className="flex flex-col gap-2">
          <span className="w-fit px-3 py-1 bg-[#E50000] text-white text-xs font-semibold rounded-md uppercase tracking-wider mb-1">
            {type === 'movie' ? 'Movies' : 'Shows'}
          </span>
          <h2 className="text-[28px] font-bold text-white">
            Explore our wide variety of categories
          </h2>
          <p className="text-[18px] text-[#999999]">
            Whether you&apos;re looking for a comedy to make you laugh, a drama
            to make you think, or a documentary to learn something new
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-8 mt-8">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] hover:border-[#ffffff30] active:scale-95 transition">
            <ArrowLeft size={16} className="text-white" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 bg-[#E50000]' : 'w-2 bg-[#333]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] hover:border-[#ffffff30] active:scale-95 transition">
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`flex gap-5 overflow-x-auto pb-2 ${isDown.current ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory', // Инициализируем snap через инлайн, чтобы управлять им динамически
        }}>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        {loopedCategories.map((cat, index) => {
          const uniqueKey = `${cat.id}-${index}`;

          return (
            <article
              key={uniqueKey}
              onClick={() => handleCategoryClick(cat.id, cat.name)}
              style={{
                minWidth: CARD_WIDTH,
                maxWidth: CARD_WIDTH,
                scrollSnapAlign: 'start',
              }}
              className="rounded-xl border border-[#262628] bg-[#1A1A1A] p-4 cursor-pointer hover:border-[#E50000] flex-shrink-0 transition-all duration-300 group relative overflow-hidden">
              <div className="relative rounded-lg overflow-hidden mb-4 bg-[#111111] p-1">
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.movies.slice(0, 4).map((movie) => (
                    <div
                      key={movie.id}
                      className="relative aspect-square overflow-hidden rounded-md bg-[#262628]">
                      {movie.poster_path ? (
                        <Image
                          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          sizes="130px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#262628]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Градиентное затемнение нижних постеров */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/30 to-transparent pointer-events-none" />
              </div>

              <div className="flex items-center justify-between pt-1 relative z-10">
                <span className="text-[16px] font-semibold text-white truncate max-w-[80%]">
                  {cat.name}
                </span>
                <ArrowRight
                  size={18}
                  className="text-[#999999] group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
