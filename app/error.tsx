'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/components/providers/LocaleProvider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative mb-8 select-none">
          <span
            className="text-[120px] font-bold leading-none text-[#E50000] opacity-10 absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{ transform: 'translate(-3px, -3px)' }}>
            500
          </span>
          <span
            className="text-[120px] font-bold leading-none text-[#E50000] opacity-10 absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{ transform: 'translate(3px, 3px)', color: '#fff' }}>
            500
          </span>
          <span className="text-[120px] font-bold leading-none text-[#E50000] relative z-10 flex items-center justify-center">
            500
          </span>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#262628] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#E50000]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {t('errors.title500')}
        </h1>
        <p className="text-[#999999] text-sm leading-relaxed mb-2">
          {t('errors.desc500')}
        </p>

        {error?.digest && (
          <p className="text-[#4C4C4C] text-xs font-mono mb-8">
            ID: {error.digest}
          </p>
        )}

        {!error?.digest && <div className="mb-8" />}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-3 bg-[#E50000] hover:bg-[#FF1919] text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer">
            {t('errors.tryAgain')}
          </button>
          <Link
            href="/"
            className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#262628] border border-[#262628] text-white text-sm font-semibold rounded-lg transition-colors duration-200">
            {t('errors.backHome')}
          </Link>
        </div>

        <div
          className="mt-16 flex items-center gap-2 justify-center opacity-20"
          aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-4 rounded-sm border border-[#333333]"
              style={{ opacity: i % 3 === 0 ? 0.4 : 1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
