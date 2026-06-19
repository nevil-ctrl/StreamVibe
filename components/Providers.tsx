'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { ConsentProvider } from '@/components/providers/ConsentProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import type { Locale } from '@/lib/i18n/config';

const SESSION_REFETCH_INTERVAL = 15 * 60;

export function Providers({
  children,
  initialLocale,
  session,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  session: Session | null;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <SessionProvider
        session={session}
        refetchInterval={SESSION_REFETCH_INTERVAL}
        refetchOnWindowFocus={false}
      >
        <ConsentProvider>{children}</ConsentProvider>
      </SessionProvider>
    </LocaleProvider>
  );
}
