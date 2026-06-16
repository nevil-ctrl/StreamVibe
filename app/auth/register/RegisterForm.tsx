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
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from '@/components/providers/LocaleProvider';
import { registerUser } from './actions';
import { Globe } from 'lucide-react';

type Movie = { poster_path: string; title: string };

export default function RegisterForm({ movies }: { movies: Movie[] }) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(null, formData);
    if (result.success) {
      if (result.message) {
        setSuccessMessage(result.message);
      }
      setIsSuccess(true);
    } else {
      setError(result.message || t('auth.registerError'));
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/browse' });
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
        <MovieBackground movies={movies} />
        <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />
        <div className="absolute top-4 right-4 z-30">
          <LanguageSwitcher />
        </div>

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

          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-(--red-45)/10 text-(--red-45) mb-6">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-(--white) mb-4">
            {t('auth.almostDone')}
          </h2>
          <p className="text-(--grey-75) text-sm mb-8 leading-relaxed">
            {successMessage || t('auth.registerSuccessDefault')}
          </p>

          <Button
            type="button"
            onClick={() => (window.location.href = '/auth/login')}
            className="w-full bg-(--red-45) hover:bg-(--red-50) text-(--white) font-medium h-12 rounded-lg transition-colors">
            {t('auth.goToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-(--black-06) px-4 py-12 overflow-hidden">
      <MovieBackground movies={movies} />
      <div className="absolute inset-0 z-10 bg-linear-to-t from-(--black-06) via-(--black-06)/40 to-(--black-06) backdrop-blur-[2px]" />
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>

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
          {t('auth.createAccount')}
        </h2>
        <p className="text-(--grey-60) text-sm text-center mb-6">
          {t('auth.registerSubtitle')}
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              {t('auth.name')}
            </label>
            <Input
              name="name"
              type="text"
              placeholder={t('settings.namePlaceholder')}
              required
              className="bg-(--black-06) border-(--black-15) text-(--white) focus:border-(--red-45) h-12 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-(--grey-75) font-medium mb-2">
              {t('auth.email')}
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
              {t('auth.password')}
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
              {t('auth.registerBtn')}
            </Button>
          )}
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--black-15)" />
          </div>
          <span className="relative z-10 bg-(--black-08) px-3 text-xs uppercase text-(--grey-60)">
            {t('auth.or')}
          </span>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-(--black-06) border border-(--black-15) hover:bg-(--black-10) text-(--white) h-12 rounded-lg flex items-center justify-center gap-3 transition-colors">
          <Globe className="h-5 w-5 text-(--grey-60)" />
          {googleLoading ? t('auth.signingInGoogle') : t('auth.registerGoogle')}
        </Button>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-(--grey-65)">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/login"
              className="text-(--white) font-medium hover:underline hover:text-(--red-45) transition-colors">
              {t('auth.signInLink')}
            </Link>
          </p>
          <Link
            href="/auth/forgot-password"
            className="block text-sm text-(--grey-60) hover:text-(--grey-75) transition-colors">
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </div>
    </div>
  );
}
