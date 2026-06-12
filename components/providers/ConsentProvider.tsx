'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { consentManager } from '@/lib/consent/consent-manager';
import { syncPostHogWithConsent } from '@/lib/consent/analytics';
import type {
  ConsentCategory,
  ConsentPreferences,
  ConsentStatus,
} from '@/lib/consent/types';
import CookieConsent from '@/components/consent/CookieConsent';
import { AnalyticsTracker } from '@/components/providers/AnalyticsTracker';
import { MediaViewTracker } from '@/components/providers/MediaViewTracker';

interface ConsentContextValue {
  prefs: ConsentPreferences | null;
  status: ConsentStatus | null;
  hasAnswered: boolean;
  hasConsent: (type: ConsentCategory) => boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ConsentPreferences | null>(null);
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    consentManager.init();
    setPrefs(consentManager.getConsent());
    setStatus(consentManager.getStatus());
    syncPostHogWithConsent();

    return consentManager.onChange((next, nextStatus) => {
      setPrefs(next);
      setStatus(nextStatus);
      syncPostHogWithConsent();
    });
  }, []);

  const hasConsent = useCallback(
    (type: ConsentCategory) => consentManager.hasConsent(type),
    [prefs, status],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      prefs,
      status,
      hasAnswered: consentManager.hasAnswered(),
      hasConsent,
      acceptAll: () => consentManager.acceptAll(),
      rejectNonEssential: () => consentManager.rejectNonEssential(),
      openSettings: () => setSettingsOpen(true),
    }),
    [prefs, status, hasConsent],
  );

  return (
    <ConsentContext.Provider value={value}>
      <PostHogProvider client={posthog}>
        <AnalyticsTracker />
        <MediaViewTracker />
        {children}
      </PostHogProvider>
      <CookieConsent
        forceSettings={settingsOpen}
        onSettingsClose={() => setSettingsOpen(false)}
      />
    </ConsentContext.Provider>
  );
}
