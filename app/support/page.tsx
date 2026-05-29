'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { fetchTMDB } from '@/services/tmdb';
import type { Movie, MovieResponse } from '@/types/movie';

const tmdbPoster = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function SupportPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>('01');

  const faqItems: FAQItem[] = [
    {
      id: '01',
      question: 'What is StreamVibe?',
      answer:
        'StreamVibe is a streaming service that allows you to watch movies and shows on demand.',
    },
    {
      id: '02',
      question: 'How much does StreamVibe cost?',
      answer:
        'We offer various plans tailored to your budget. Check our Subscriptions page for details.',
    },
    {
      id: '03',
      question: 'What content is available on StreamVibe?',
      answer:
        'Thousands of movies, series, documentaries, and exclusive originals available anytime.',
    },
    {
      id: '04',
      question: 'How can I watch StreamVibe?',
      answer:
        'You can watch via any smartphone, tablet, smart TV, laptop, or streaming device.',
    },
    {
      id: '05',
      question: 'How do I sign up for StreamVibe?',
      answer:
        'Click the Sign Up button, choose your plan, enter your details, and start streaming instantly.',
    },
    {
      id: '06',
      question: 'What is the StreamVibe free trial?',
      answer:
        'New users get a 7-day free trial to explore all features and content without limits.',
    },
    {
      id: '07',
      question: 'How do I contact StreamVibe customer support?',
      answer:
        'Fill out the form above, or hit the "Ask a Question" button to launch live chat.',
    },
    {
      id: '08',
      question: 'What are the StreamVibe payment methods?',
      answer:
        'We accept major credit cards, PayPal, Apple Pay, and Google Pay.',
    },
  ];

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await fetchTMDB<MovieResponse>('/movie/popular?page=1');
        if (data && data.results) {
          setMovies(data.results.slice(0, 16));
        }
      } catch (error) {
        console.error('Ошибка загрузки фильмов из TMDB:', error);
      }
    }
    loadMovies();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const halfFaq = Math.ceil(faqItems.length / 2);
  const leftFaqColumn = faqItems.slice(0, halfFaq);
  const rightFaqColumn = faqItems.slice(halfFaq);

  const col1 = movies.slice(0, 4);
  const col2 = movies.slice(4, 8);
  const col3 = movies.slice(8, 12);
  const col4 = movies.slice(12, 16);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans selection:bg-[#E50000]">
      {/* Инжектим стили для бесконечного скролла прямо в компонент */}
      <style jsx global>{`
        @keyframes marqueeUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes marqueeDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-marquee-up {
          animation: marqueeUp 25s linear infinite;
        }
        .animate-marquee-down {
          animation: marqueeDown 25s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20 md:mb-28">
          <div className="lg:col-span-5 flex flex-col gap-8 h-full justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Welcome to our support page!
              </h1>
              <p className="text-[#999999] text-sm md:text-base leading-relaxed">
                Were here to help you with any problems you may be having with
                our product.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[#262628] bg-[#0A0A0A] p-3 h-[480px] overflow-hidden opacity-70 hover:opacity-90 transition-opacity duration-300 pointer-events-none hidden sm:block">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />

              <div className="grid grid-cols-4 gap-2 h-full">
                {movies.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-2 animate-marquee-down">
                      {[...col1, ...col1].map((movie, idx) => (
                        <div
                          key={`col1-${movie.id}-${idx}`}
                          className="relative rounded-md overflow-hidden bg-[#1A1A1A] aspect-[2/3] w-full shrink-0">
                          <Image
                            src={tmdbPoster(movie.poster_path)}
                            alt={movie.title}
                            fill
                            sizes="10vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 animate-marquee-up">
                      {[...col2, ...col2].map((movie, idx) => (
                        <div
                          key={`col2-${movie.id}-${idx}`}
                          className="relative rounded-md overflow-hidden bg-[#1A1A1A] aspect-[2/3] w-full shrink-0">
                          <Image
                            src={tmdbPoster(movie.poster_path)}
                            alt={movie.title}
                            fill
                            sizes="10vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 animate-marquee-down">
                      {[...col3, ...col3].map((movie, idx) => (
                        <div
                          key={`col3-${movie.id}-${idx}`}
                          className="relative rounded-md overflow-hidden bg-[#1A1A1A] aspect-[2/3] w-full shrink-0">
                          <Image
                            src={tmdbPoster(movie.poster_path)}
                            alt={movie.title}
                            fill
                            sizes="10vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 animate-marquee-up">
                      {[...col4, ...col4].map((movie, idx) => (
                        <div
                          key={`col4-${movie.id}-${idx}`}
                          className="relative rounded-md overflow-hidden bg-[#1A1A1A] aspect-[2/3] w-full shrink-0">
                          <Image
                            src={tmdbPoster(movie.poster_path)}
                            alt={movie.title}
                            fill
                            sizes="10vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  Array.from({ length: 4 }).map((_, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-[#1A1A1A] rounded-md animate-pulse aspect-[2/3] w-full"
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0F0F0F] border border-[#262628] p-6 md:p-10 rounded-xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    className="w-full bg-[#141414] border border-[#262628] rounded-md px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none focus:border-[#E50000] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    className="w-full bg-[#141414] border border-[#262628] rounded-md px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none focus:border-[#E50000] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    className="w-full bg-[#141414] border border-[#262628] rounded-md px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none focus:border-[#E50000] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">
                    Phone Number
                  </label>
                  <div className="flex bg-[#141414] border border-[#262628] rounded-md overflow-hidden focus-within:border-[#E50000] transition-colors">
                    <div className="flex items-center gap-1 bg-[#1A1A1A] px-3 border-r border-[#262628] text-sm text-gray-400 select-none cursor-pointer">
                      <span>🇮🇳</span>
                      <span className="text-xs">▼</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter Phone Number"
                      className="w-full bg-transparent px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter your Message"
                  className="w-full bg-[#141414] border border-[#262628] rounded-md px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm resize-none focus:outline-none focus:border-[#E50000] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none group text-xs md:text-sm text-[#999999]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-[#E50000] bg-[#141414] border-[#262628] cursor-pointer"
                  />
                  <span>
                    I agree with{' '}
                    <span className="underline group-hover:text-white transition-colors">
                      Terms of Use
                    </span>{' '}
                    and{' '}
                    <span className="underline group-hover:text-white transition-colors">
                      Privacy Policy
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#E50000] hover:bg-[#FF1919] text-white px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-lg active:scale-[0.98]">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-[#999999] text-sm md:text-base max-w-3xl">
                Got questions? Weve got answers! Check out our FAQ section to
                find answers to the most common questions about StreamVibe.
              </p>
            </div>
            <button className="bg-[#E50000] hover:bg-[#FF1919] text-white px-5 py-3 rounded-md font-medium text-sm whitespace-nowrap self-start sm:self-auto transition-colors">
              Ask a Question
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start pt-4">
            <div className="flex flex-col gap-y-5 w-full">
              {leftFaqColumn.map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div
                    key={item.id}
                    className="border-b border-[#262628] pb-5 flex gap-4 md:gap-5 items-start transition-all">
                    <div className="bg-[#1A1A1A] border border-[#262628] rounded-md px-3 py-2 text-sm md:text-base font-bold text-white min-w-10 text-center">
                      {item.id}
                    </div>
                    <div className="flex-1 space-y-3">
                      <button
                        onClick={() => toggleFaq(item.id)}
                        className="w-full flex items-center justify-between text-left group">
                        <span className="font-semibold text-base md:text-lg text-white group-hover:text-[#E50000] transition-colors">
                          {item.question}
                        </span>
                        <span className="text-white ml-4 shrink-0">
                          {isOpen ? (
                            <Minus className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-200 ease-in-out text-sm md:text-base text-[#999999] leading-relaxed ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                        <div className="overflow-hidden">
                          <p className="pt-1">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-y-5 w-full lg:mt-0 mt-5">
              {rightFaqColumn.map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div
                    key={item.id}
                    className="border-b border-[#262628] pb-5 flex gap-4 md:gap-5 items-start transition-all">
                    <div className="bg-[#1A1A1A] border border-[#262628] rounded-md px-3 py-2 text-sm md:text-base font-bold text-white min-w-10 text-center">
                      {item.id}
                    </div>
                    <div className="flex-1 space-y-3">
                      <button
                        onClick={() => toggleFaq(item.id)}
                        className="w-full flex items-center justify-between text-left group">
                        <span className="font-semibold text-base md:text-lg text-white group-hover:text-[#E50000] transition-colors">
                          {item.question}
                        </span>
                        <span className="text-white ml-4 shrink-0">
                          {isOpen ? (
                            <Minus className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-200 ease-in-out text-sm md:text-base text-[#999999] leading-relaxed ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                        <div className="overflow-hidden">
                          <p className="pt-1">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
