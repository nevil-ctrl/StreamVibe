export const LOCALES = ['en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'stream-vibe-locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'ru';
}

export function getTmdbLanguage(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US';
}

export function getDateLocale(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US';
}
