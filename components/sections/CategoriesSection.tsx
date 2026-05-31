'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';

type Movie = { id: number; poster_path: string; title: string };
// ИСПРАВЛЕНО: id теперь может быть и строкой, и числом
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

  const loopedCategories = [...categories, ...categories, ...categories];
  const originalLength = categories.length;
  const singleSetWidth = (CARD_WIDTH + GAP) * originalLength;

  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.scrollLeft = singleSetWidth;
    }
  }, [singleSetWidth]);

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
    if (!el) return;

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

  const handleCategoryClick = (id: number | string, name: string) => {
    // Если id — строка (например, 'trending', 'popular'), передаем его в другой параметр или как фильтр сортировки,
    // а если число — передаем в genre.
    if (typeof id === 'string') {
      router.push(
        `/browse?type=${type}&status=${id}&name=${encodeURIComponent(name)}`,
      );
    } else {
      router.push(
        `/browse?type=${type}&genre=${id}&name=${encodeURIComponent(name)}`,
      );
    }
  };

  const totalSlides = Math.ceil(originalLength / VISIBLE);

  return (
    <section className="container py-20">
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
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] transition">
            <ArrowLeft size={16} className="text-white" />
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
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#262628] hover:bg-[#262628] transition">
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}>
        {loopedCategories.map((cat, index) => (
          <article
            key={`${cat.id}-${index}`}
            onClick={() => handleCategoryClick(cat.id, cat.name)}
            style={{ minWidth: CARD_WIDTH }}
            className="rounded-xl border border-[#262628] bg-[#1A1A1A] overflow-hidden cursor-pointer hover:border-[#E50000] transition group select-none">
            <div className="grid grid-cols-2 gap-0.75">
              {cat.movies.slice(0, 4).map((movie) => (
                <div
                  key={movie.id}
                  className="relative aspect-square overflow-hidden">
                  <Image
                    src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="130px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[15px] font-medium text-white">
                {cat.name}
              </span>
              <ArrowRight size={18} className="text-white" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
