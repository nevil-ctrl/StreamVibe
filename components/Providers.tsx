'use client';

import { SessionProvider } from 'next-auth/react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { publicEnv } from '@/config/env.public';

if (typeof window !== 'undefined') {
  posthog.init(publicEnv.POSTHOG_KEY, {
    api_host: publicEnv.POSTHOG_HOST,
    person_profiles: 'identified_only',
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogProvider client={posthog}>{children}</PostHogProvider>
    </SessionProvider>
  );
}
