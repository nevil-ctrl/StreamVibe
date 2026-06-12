'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingButton } from '@/components/ui/loading-button';
import { Globe } from 'lucide-react';
import MovieBackground from '@/components/auth/MovieBackground';
import { checkAccountStatus, resendVerificationLink } from './actions';

// 1. Описываем четкий тип для фильма, чтобы TS не ругался
type Movie = {
  poster_path: string;
  title: string;
};

interface LoginFormProps {
  movies: Movie[]; // Никаких any! Теперь всё типизировано.
}

export default function LoginForm({ movies }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    urlError === 'AccessDenied'
      ? 'Доступ запрещен. Проверьте подтверждение почты.'
      : urlError
        ? 'Неверный email или пароль'
        : '',
  );
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsUnverified(false);
    setResendSuccess(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Проверяем детальный статус пользователя
        const status = await checkAccountStatus(email);
        if (status.exists) {
          if (status.isBanned) {
            setError('Ваш аккаунт заблокирован.');
          } else if (!status.emailVerified) {
            setIsUnverified(true);
            setError('Ваш адрес электронной почты не подтвержден.');
          } else {
            setError('Неверный логин или пароль');
          }
        } else {
          setError('Неверный логин или пароль');
        }
      } else {
        router.push('/browse');
        router.refresh();
      }
    } catch {
      setError('Что-то пошло не так. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    try {
      const res = await resendVerificationLink(email);
      if (res.success) {
        setResendSuccess(res.message);
        setError('');
      } else {
        setError(res.message || 'Не удалось отправить ссылку.');
      }
    } catch {
      setError('Ошибка при отправке ссылки.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/browse' });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
      {/* Задний фон с постерами (z-0) */}
      <MovieBackground movies={movies} />

      {/* ИСПРАВЛЕННЫЙ ОВЕРЛЕЙ: Изменили сплошной черный на радиальное/линейное размытие */}
      <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />

      {/* Сама карточка логина (z-20) */}
      <div className="relative z-20 w-full max-w-120 rounded-xl border border-(--black-15) bg-(--black-08)/95 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
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

        <h2 className="text-2xl md:text-3xl font-bold text-(--white) text-center mb-2">
          С возвращением!
        </h2>
        <p className="text-(--grey-60) text-sm text-center mb-6">
          Введите данные для входа в StreamVibe
        </p>

        {error && (
          <div className="mb-4 space-y-2">
            <ErrorMessage message={error} />
            {isUnverified && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-xs text-(--red-45) hover:text-(--red-55) font-medium underline block transition-colors mt-2 text-left cursor-pointer">
                {resendLoading ? 'Отправка...' : 'Отправить письмо подтверждения повторно'}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs text-left">
            {resendSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              Email Адрес
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
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-(--grey-75) font-medium">
                Пароль
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-(--grey-60) hover:text-(--red-45) hover:underline transition-colors cursor-pointer">
                Забыли пароль?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
            />
          </div>

          {loading ? (
            <LoadingButton className="w-full bg-(--red-45) text-(--white) font-medium h-12 rounded-lg" />
          ) : (
            <Button
              type="submit"
              className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors">
              Войти
            </Button>
          )}
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--black-15)"></div>
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
          {googleLoading ? 'Вход...' : 'Войти через Google'}
        </Button>

        <p className="mt-8 text-center text-sm text-(--grey-65)">
          Впервые на StreamVibe?{' '}
          <Link
            href="/auth/register"
            className="text-(--white) font-medium hover:underline hover:text-(--red-45) transition-colors">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
