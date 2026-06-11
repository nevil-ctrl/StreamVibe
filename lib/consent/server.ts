import { cookies } from 'next/headers';
import {
  CONSENT_COOKIE_NAME,
  CONSENT_PREFS_COOKIE_NAME,
  DEFAULT_ACCEPTED,
  DEFAULT_REJECTED,
  type ConsentCategory,
  type ConsentPreferences,
  type ConsentStatus,
} from './types';

interface ConsentPrefsCookie {
  functional?: boolean;
  analytics?: boolean;
  personalization?: boolean;
}

/** Читает согласие на сервере из cookies (для API routes и server actions). */
export async function getServerConsent(): Promise<{
  prefs: ConsentPreferences | null;
  status: ConsentStatus | null;
}> {
  const store = await cookies();
  const status = store.get(CONSENT_COOKIE_NAME)?.value as
    | ConsentStatus
    | undefined;

  if (!status || !['accepted', 'rejected', 'custom'].includes(status)) {
    return { prefs: null, status: null };
  }

  if (status === 'accepted') {
    return {
      prefs: { ...DEFAULT_ACCEPTED, updatedAt: '' },
      status,
    };
  }

  if (status === 'rejected') {
    return {
      prefs: { ...DEFAULT_REJECTED, updatedAt: '' },
      status,
    };
  }

  const prefsRaw = store.get(CONSENT_PREFS_COOKIE_NAME)?.value;
  if (!prefsRaw) {
    return { prefs: { ...DEFAULT_REJECTED, updatedAt: '' }, status };
  }

  try {
    const parsed = JSON.parse(prefsRaw) as ConsentPrefsCookie;
    return {
      prefs: {
        essential: true,
        functional: Boolean(parsed.functional),
        analytics: Boolean(parsed.analytics),
        personalization: Boolean(parsed.personalization),
        updatedAt: '',
      },
      status,
    };
  } catch {
    return { prefs: { ...DEFAULT_REJECTED, updatedAt: '' }, status };
  }
}

/** Проверка категории на сервере. Без ответа пользователя — только essential. */
export async function hasServerConsent(
  type: ConsentCategory,
): Promise<boolean> {
  if (type === 'essential') return true;
  const { prefs } = await getServerConsent();
  if (!prefs) return false;
  return Boolean(prefs[type]);
}

/** Разрешена ли запись истории просмотров. */
export async function canRecordWatchHistory(): Promise<boolean> {
  const { prefs } = await getServerConsent();
  if (!prefs) return false;
  return prefs.functional || prefs.personalization;
}

/** Разрешена ли запись PageView в БД. */
export async function canRecordPageView(): Promise<boolean> {
  return hasServerConsent('analytics');
}
