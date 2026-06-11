/**
 * Обёртка над PostHog — события отправляются только при analytics-согласии.
 */
import posthog from 'posthog-js';
import { publicEnv } from '@/config/env.public';
import { consentManager } from './consent-manager';

let initialized = false;

/** Инициализирует PostHog и применяет opt-in/opt-out по текущему согласию. */
export function syncPostHogWithConsent(): void {
  if (typeof window === 'undefined') return;
  if (!publicEnv.POSTHOG_KEY) return;

  const analyticsAllowed = consentManager.hasConsent('analytics');

  if (!initialized) {
    posthog.init(publicEnv.POSTHOG_KEY, {
      api_host: publicEnv.POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false,
      persistence: analyticsAllowed ? 'localStorage+cookie' : 'memory',
      opt_out_capturing_by_default: true,
    });
    initialized = true;
  }

  if (analyticsAllowed) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

/** Безопасная отправка события — только при analytics=true. */
export function captureAnalyticsEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!consentManager.hasConsent('analytics')) return;
  if (!initialized) syncPostHogWithConsent();
  if (!consentManager.hasConsent('analytics')) return;

  try {
    posthog.capture(event, properties);
  } catch {
    // Аналитика не должна ломать UX
  }
}

/** События платформы (после согласия на аналитику). */
export const AnalyticsEvents = {
  pageView: (path: string) =>
    captureAnalyticsEvent('page_view', { path }),

  movieView: (payload: {
    id: string;
    type: 'movie' | 'tv';
    title?: string;
  }) => captureAnalyticsEvent('movie_view', payload),

  watchProgress: (payload: {
    id: string;
    type: 'movie' | 'tv';
    progressSeconds: number;
    durationSeconds: number;
  }) => captureAnalyticsEvent('watch_progress', payload),

  favoriteAdded: (payload: {
    id: string;
    type: 'movie' | 'tv';
    title?: string;
  }) => captureAnalyticsEvent('favorite_added', payload),

  ratingAdded: (payload: {
    id: string;
    type: 'movie' | 'tv';
    rating: number;
  }) => captureAnalyticsEvent('rating_added', payload),
};

/** Заголовки согласия для API-запросов (дублирует cookie для надёжности). */
export function getConsentHeaders(): Record<string, string> {
  const prefs = consentManager.getConsent();
  if (!prefs) return { 'X-Consent-Given': 'false' };

  return {
    'X-Consent-Given': 'true',
    'X-Consent-Analytics': String(prefs.analytics),
    'X-Consent-Functional': String(prefs.functional),
    'X-Consent-Personalization': String(prefs.personalization),
  };
}
