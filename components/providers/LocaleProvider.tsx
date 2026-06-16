'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { createTranslator, type Translator } from '@/lib/i18n/translate';
import { setLocale } from '@/app/actions/locale.actions';

interface LocaleContextValue {
  locale: Locale;
  t: Translator;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [isPending, startTransition] = useTransition();

  const t = useMemo(() => createTranslator(getMessages(locale)), [locale]);

  const changeLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;

      setLocaleState(next);
      document.documentElement.lang = next;

      startTransition(async () => {
        await setLocale(next);
        router.refresh();
      });
    },
    [locale, router],
  );

  const value = useMemo(
    () => ({ locale, t, setLocale: changeLocale, isPending }),
    [locale, t, changeLocale, isPending],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

export function useTranslations() {
  return useLocale().t;
}
