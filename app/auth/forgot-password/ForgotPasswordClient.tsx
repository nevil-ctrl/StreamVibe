'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingButton } from '@/components/ui/loading-button';
import MovieBackground from '@/components/auth/MovieBackground';
import { requestPasswordReset, resetPasswordWithCode } from './actions';

type Movie = { poster_path: string; title: string };

interface ForgotPasswordClientProps {
  movies: Movie[];
}

export default function ForgotPasswordClient({ movies }: ForgotPasswordClientProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setMessage(res.message);
        setStep(2);
      } else {
        setError(res.message || 'Ошибка отправки запроса.');
      }
    } catch {
      setError('Не удалось отправить код. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await resetPasswordWithCode(email, code.trim(), newPassword);
      if (res.success) {
        setMessage(res.message);
        setStep(3);
      } else {
        setError(res.message || 'Ошибка сброса пароля.');
      }
    } catch {
      setError('Не удалось сбросить пароль. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
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
              alt="StreamVibe Logo"
              width={160}
              height={50}
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-(--white) text-center mb-2">
          {step === 1 && 'Восстановление пароля'}
          {step === 2 && 'Введите код'}
          {step === 3 && 'Успешно!'}
        </h2>
        <p className="text-(--grey-60) text-sm text-center mb-6">
          {step === 1 && 'Введите ваш email для получения кода сброса'}
          {step === 2 && 'Мы отправили 6-значный код на вашу почту'}
          {step === 3 && 'Ваш пароль успешно изменен'}
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {message && step !== 3 && (
          <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs text-center">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
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

            {loading ? (
              <LoadingButton className="w-full bg-(--red-45) text-(--white) h-12 rounded-lg" />
            ) : (
              <Button
                type="submit"
                className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors cursor-pointer">
                Получить код
              </Button>
            )}
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-(--grey-75) font-medium mb-2 text-center">
                Код подтверждения (6 цифр)
              </label>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg text-center tracking-[0.5em] text-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-sm text-(--grey-75) font-medium mb-2">
                Новый пароль
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-(--grey-75) font-medium mb-2">
                Подтвердите пароль
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
              />
            </div>

            {loading ? (
              <LoadingButton className="w-full bg-(--red-45) text-(--white) h-12 rounded-lg" />
            ) : (
              <Button
                type="submit"
                className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors cursor-pointer">
                Сбросить пароль
              </Button>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-(--grey-60) hover:text-(--white) underline mt-2 block transition-colors cursor-pointer">
              Изменить почту
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-(--red-45)/10 text-(--red-45)">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-(--grey-75) text-sm leading-relaxed">
              {message || 'Ваш пароль успешно изменен. Теперь вы можете войти в аккаунт с новыми учетными данными.'}
            </p>
            <Button
              type="button"
              onClick={() => window.location.href = '/auth/login'}
              className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors cursor-pointer">
              Войти в аккаунт
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-(--grey-60) hover:text-(--white) transition-colors underline">
            Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  );
}
