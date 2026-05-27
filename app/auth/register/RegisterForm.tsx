'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingButton } from '@/components/ui/loading-button';
import { ErrorMessage } from '@/components/ui/error-message';
import MovieBackground from '@/components/auth/MovieBackground';
import { registerUser } from './actions';
import { Globe } from 'lucide-react';

type Movie = { poster_path: string; title: string };

export default function RegisterForm({ movies }: { movies: Movie[] }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(null, formData);
    if (result.success) {
      window.location.href = '/auth/login';
    } else {
      setError(result.message || 'Ошибка регистрации');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/browse' });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
      <MovieBackground movies={movies} />
      <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-120 rounded-xl border border-(--black-15) bg-(--black-08)/95 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo/Logo.svg"
              alt="StreamVibe"
              width={160}
              height={50}
              priority
              style={{ height: 'auto' }}
            />
          </Link>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-(--white) text-center mb-2">
          Создать аккаунт
        </h2>
        <p className="text-(--grey-60) text-sm text-center mb-6">
          Присоединяйтесь к StreamVibe
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              Имя
            </label>
            <Input
              name="name"
              type="text"
              placeholder="Ваше имя"
              required
              className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              Email
            </label>
            <Input
              name="email"
              type="email"
              placeholder="example@mail.com"
              required
              className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              Пароль
            </label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
            />
          </div>

          {loading ? (
            <LoadingButton className="w-full bg-(--red-45) text-(--white) h-12 rounded-lg" />
          ) : (
            <Button
              type="submit"
              className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors">
              Зарегистрироваться
            </Button>
          )}
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--black-15)" />
          </div>
          <span className="relative z-10 bg-(--black-08) px-3 text-xs uppercase text-(--grey-60)">
            или
          </span>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-(--black-06) border border-(--black-15) hover:bg-(--black-10) text-(--white) h-12 rounded-lg flex items-center justify-center gap-3 transition-colors">
          <Globe className="h-5 w-5 text-(--grey-60)" />
          {googleLoading ? 'Вход...' : 'Зарегистрироваться через Google'}
        </Button>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-(--grey-65)">
            Уже есть аккаунт?{' '}
            <Link
              href="/auth/login"
              className="text-(--white) font-medium hover:underline hover:text-(--red-45) transition-colors">
              Войти
            </Link>
          </p>
          <Link
            href="/auth/forgot-password"
            className="block text-sm text-(--grey-60) hover:text-(--grey-75) transition-colors">
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  );
}
