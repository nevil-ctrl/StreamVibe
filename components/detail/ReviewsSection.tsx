'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Star, Plus } from 'lucide-react';
import type { TMDBReview, LocalComment } from '@/types/media-detail';
import { tmdbProfile } from '@/lib/tmdb-images';

interface ReviewItem {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  avatar: string | null;
  source: 'tmdb' | 'local';
}

interface ReviewsSectionProps {
  tmdbReviews: TMDBReview[];
  localComments?: LocalComment[];
}

function mapReviews(
  tmdbReviews: TMDBReview[],
  localComments: LocalComment[],
): ReviewItem[] {
  const tmdb = tmdbReviews.slice(0, 8).map((r) => ({
    id: r.id,
    author: r.author,
    content: r.content,
    rating: r.author_details?.rating ?? null,
    avatar: tmdbProfile(r.author_details?.avatar_path ?? null),
    source: 'tmdb' as const,
  }));

  const local = localComments.map((c) => ({
    id: c.id,
    author: c.user.name ?? 'User',
    content: c.content,
    rating: null,
    avatar: c.user.image,
    source: 'local' as const,
  }));

  return [...local, ...tmdb];
}

export default function ReviewsSection({
  tmdbReviews,
  localComments = [],
}: ReviewsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reviews = mapReviews(tmdbReviews, localComments);

  const scroll = (dir: 'left' | 'right') => {
    const next =
      dir === 'right'
        ? Math.min(reviews.length - 1, activeIndex + 1)
        : Math.max(0, activeIndex - 1);
    setActiveIndex(next);
    trackRef.current?.children[next]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <section className="rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Reviews</h2>
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#262628] bg-[#141414] px-4 py-2 text-sm text-white transition hover:border-[#E50000]">
          <Plus size={16} />
          Add Your Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-[#999999]">
          Отзывов пока нет. Станьте первым после просмотра!
        </p>
      ) : (
        <>
          <div
            ref={trackRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}>
            {reviews.map((review) => (
              <article
                key={review.id}
                className="w-[min(100%,420px)] shrink-0 snap-center rounded-xl border border-[#262628] bg-[#141414] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#262628]">
                    {review.avatar ? (
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#666666]">
                        {review.author[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {review.author}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {review.source === 'local'
                        ? 'StreamVibe'
                        : 'From TMDB'}
                    </p>
                  </div>
                </div>

                {review.rating != null && (
                  <div className="mb-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(review.rating! / 2)
                            ? 'text-[#E50000]'
                            : 'text-[#333333]'
                        }
                        fill={
                          i < Math.round(review.rating! / 2)
                            ? '#E50000'
                            : 'transparent'
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs text-[#999999]">
                      {(review.rating / 2).toFixed(1)}
                    </span>
                  </div>
                )}

                <p className="line-clamp-4 text-sm leading-relaxed text-[#999999]">
                  {review.content}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === activeIndex ? 'w-6 bg-[#E50000]' : 'w-3 bg-[#333333]'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={activeIndex === 0}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30 disabled:opacity-40">
                <ArrowLeft size={16} className="text-white" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={activeIndex >= reviews.length - 1}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#262628] bg-[#141414] transition hover:border-white/30 disabled:opacity-40">
                <ArrowRight size={16} className="text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
