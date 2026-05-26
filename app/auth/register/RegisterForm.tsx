'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingButton } from '@/components/ui/loading-button';
import MovieBackground from '@/components/auth/MovieBackground';
import { registerUser } from './actions'; // ИМПОРТ ACTION

type Movie = {
  poster_path: string;
  title: string;
};

interface RegisterFormProps {
  movies: Movie[];
}

export default function RegisterForm({ movies }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Вызываем серверный Action
    const result = await registerUser(null, formData);

    if (result.success) {
      window.location.href = '/auth/login'; // Успех - идем на страницу логина
    } else {
      setError(result.message || 'Ошибка регистрации');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
      <MovieBackground movies={movies} />
      <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-120 rounded-xl border border-(--black-15) bg-(--black-08)/95 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
        {/* ... блок логотипа ... */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              Имя
            </label>
            <Input
              name="name"
              type="text"
              placeholder="Ваше имя"
              required
              className="bg-(--black-06) border-(--black-15) h-12 rounded-lg"
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
              className="bg-(--black-06) border-(--black-15) h-12 rounded-lg"
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
              className="bg-(--black-06) border-(--black-15) h-12 rounded-lg"
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
        <p className="mt-8 text-center text-sm text-(--grey-65)">
          Уже есть аккаунт?{' '}
          <Link
            href="/auth/login"
            className="text-(--white) font-medium hover:underline hover:text-(--red-45)">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
