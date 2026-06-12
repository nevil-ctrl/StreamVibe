/** Категории cookie-согласия (GDPR). */
export type ConsentCategory =
  | 'essential'
  | 'functional'
  | 'analytics'
  | 'personalization';

/** Статус выбора пользователя, хранится в cookie `cookie_consent`. */
export type ConsentStatus = 'accepted' | 'rejected' | 'custom';

/** Полные настройки согласия — ключ localStorage `cookie_consent`. */
export interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  personalization: boolean;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = 'cookie_consent';
export const CONSENT_COOKIE_NAME = 'cookie_consent';
export const CONSENT_PREFS_COOKIE_NAME = 'cookie_consent_prefs';

export const DEFAULT_REJECTED: ConsentPreferences = {
  essential: true,
  functional: false,
  analytics: false,
  personalization: false,
  updatedAt: '',
};

export const DEFAULT_ACCEPTED: ConsentPreferences = {
  essential: true,
  functional: true,
  analytics: true,
  personalization: true,
  updatedAt: '',
};
