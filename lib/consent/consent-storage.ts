import {
  CONSENT_COOKIE_NAME,
  CONSENT_PREFS_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  type ConsentPreferences,
  type ConsentStatus,
} from './types';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 год

/** Записывает cookie с указанным сроком жизни. */
function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/** Читает значение cookie по имени. */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Сохраняет согласие в localStorage и cookies. */
export function persistConsent(
  prefs: ConsentPreferences,
  status: ConsentStatus,
): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
  setCookie(CONSENT_COOKIE_NAME, status);
  setCookie(
    CONSENT_PREFS_COOKIE_NAME,
    JSON.stringify({
      functional: prefs.functional,
      analytics: prefs.analytics,
      personalization: prefs.personalization,
    }),
  );
}

/** Загружает согласие из localStorage. */
export function loadConsentFromStorage(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (typeof parsed.essential !== 'boolean') return null;
    return {
      essential: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      personalization: Boolean(parsed.personalization),
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return null;
  }
}

/** Возвращает статус согласия из cookie. */
export function loadConsentStatus(): ConsentStatus | null {
  const value = getCookie(CONSENT_COOKIE_NAME);
  if (value === 'accepted' || value === 'rejected' || value === 'custom') {
    return value;
  }
  return null;
}
