'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/error-message';
import MovieBackground from '@/components/auth/MovieBackground';
import { resendVerificationLink } from '../login/actions';

type Movie = { poster_path: string; title: string };

interface VerifyEmailClientProps {
  movies: Movie[];
  initialSuccess: boolean;
  initialMessage: string;
}

export default function VerifyEmailClient({
  movies,
  initialSuccess,
  initialMessage,
}: VerifyEmailClientProps) {
  const [success] = useState(initialSuccess);
  const [message] = useState(initialMessage);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendSuccess(null);

    try {
      const res = await resendVerificationLink(email);
      if (res.success) {
        setResendSuccess(res.message);
      } else {
        setError(res.message || 'Не удалось отправить ссылку.');
      }
    } catch {
      setError('Ошибка при отправке ссылки.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
      <MovieBackground movies={movies} />
      <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-120 rounded-xl border border-(--black-15) bg-(--black-08)/95 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md text-center">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo/Logo.svg"
              alt="StreamVibe Logo"
              width={160}
              height={50}
              priority
              style={{ height: 'auto' }}
            />
          </Link>
        </div>

        {success ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-(--red-45)/10 text-(--red-45) mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-(--white) mb-4">
              Почта подтверждена!
            </h2>
            <p className="text-(--grey-75) text-sm mb-8 leading-relaxed">
              {message}
            </p>

            <Button
              type="button"
              onClick={() => window.location.href = '/auth/login'}
              className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors cursor-pointer">
              Войти в аккаунт
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-(--red-45)/10 text-(--red-45) mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-(--white) mb-4">
              Ошибка подтверждения
            </h2>
            <p className="text-(--grey-75) text-sm mb-6 leading-relaxed">
              {message}
            </p>

            {error && (
              <div className="mb-4">
                <ErrorMessage message={error} />
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs">
                {resendSuccess}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <label className="block text-sm text-(--grey-75) font-medium mb-2">
                  Email для новой ссылки
                </label>
                <Input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors cursor-pointer">
                {loading ? 'Отправка...' : 'Получить новую ссылку'}
              </Button>
            </form>

            <Link
              href="/auth/login"
              className="block mt-6 text-sm text-(--grey-60) hover:text-(--white) transition-colors">
              Вернуться к входу
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
