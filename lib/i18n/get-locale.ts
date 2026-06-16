import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from './config';
import { getMessages } from './messages';
import { createTranslator } from './translate';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  return {
    locale,
    t: createTranslator(messages),
    messages,
  };
}
