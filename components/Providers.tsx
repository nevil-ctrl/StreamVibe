'use client';

import { SessionProvider } from 'next-auth/react';
import { ConsentProvider } from '@/components/providers/ConsentProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import type { Locale } from '@/lib/i18n/config';

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <SessionProvider>
        <ConsentProvider>{children}</ConsentProvider>
      </SessionProvider>
    </LocaleProvider>
  );
}
