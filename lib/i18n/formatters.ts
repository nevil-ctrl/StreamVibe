import { getDateLocale, type Locale } from './config';
import type { Translator } from './translate';

export function formatDate(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(getDateLocale(locale), options);
}

export function timeAgo(iso: string, locale: Locale, t: Translator): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return t('time.justNow');
  if (mins < 60) return t('time.minutesAgo', { count: mins });

  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });

  const days = Math.floor(hours / 24);
  return t('time.daysAgo', { count: days });
}
