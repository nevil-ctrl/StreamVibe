'use client';

import { SessionProvider } from 'next-auth/react';
import { ConsentProvider } from '@/components/providers/ConsentProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConsentProvider>{children}</ConsentProvider>
    </SessionProvider>
  );
}
