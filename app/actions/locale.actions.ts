'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from '@/lib/i18n/config';

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
