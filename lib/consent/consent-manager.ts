/**
 * ConsentManager — единая точка управления cookie-согласием.
 * Работает в браузере; не зависит от React/Next.js.
 */
import {
  loadConsentFromStorage,
  loadConsentStatus,
  persistConsent,
} from './consent-storage';
import {
  DEFAULT_ACCEPTED,
  DEFAULT_REJECTED,
  type ConsentCategory,
  type ConsentPreferences,
  type ConsentStatus,
} from './types';

type ConsentListener = (prefs: ConsentPreferences, status: ConsentStatus) => void;

class ConsentManager {
  private prefs: ConsentPreferences | null = null;
  private status: ConsentStatus | null = null;
  private listeners = new Set<ConsentListener>();

  /** Инициализация — вызывается один раз при загрузке страницы. */
  init(): void {
    if (typeof window === 'undefined') return;
    this.prefs = loadConsentFromStorage();
    this.status = loadConsentStatus();
  }

  /** Текущие настройки или null, если пользователь ещё не ответил. */
  getConsent(): ConsentPreferences | null {
    return this.prefs ? { ...this.prefs } : null;
  }

  /** Статус выбора: accepted | rejected | custom | null. */
  getStatus(): ConsentStatus | null {
    return this.status;
  }

  /** Был ли уже дан ответ (баннер не показываем повторно). */
  hasAnswered(): boolean {
    return this.prefs !== null && this.status !== null;
  }

  /** Проверка разрешения для категории. Essential всегда true после ответа. */
  hasConsent(type: ConsentCategory): boolean {
    if (type === 'essential') return true;
    if (!this.prefs) return false;
    return Boolean(this.prefs[type]);
  }

  /** Установить произвольные настройки. */
  setConsent(
    prefs: Omit<ConsentPreferences, 'essential' | 'updatedAt'> & {
      essential?: boolean;
    },
    status: ConsentStatus = 'custom',
  ): void {
    const next: ConsentPreferences = {
      essential: true,
      functional: Boolean(prefs.functional),
      analytics: Boolean(prefs.analytics),
      personalization: Boolean(prefs.personalization),
      updatedAt: new Date().toISOString(),
    };

    this.prefs = next;
    this.status = status;
    persistConsent(next, status);
    this.notify(next, status);
  }

  /** Принять все категории. */
  acceptAll(): void {
    const next: ConsentPreferences = {
      ...DEFAULT_ACCEPTED,
      updatedAt: new Date().toISOString(),
    };
    this.prefs = next;
    this.status = 'accepted';
    persistConsent(next, 'accepted');
    this.notify(next, 'accepted');
  }

  /** Только необходимые cookies. */
  rejectNonEssential(): void {
    const next: ConsentPreferences = {
      ...DEFAULT_REJECTED,
      updatedAt: new Date().toISOString(),
    };
    this.prefs = next;
    this.status = 'rejected';
    persistConsent(next, 'rejected');
    this.notify(next, 'rejected');
  }

  /** Подписка на изменение согласия. */
  onChange(listener: ConsentListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(prefs: ConsentPreferences, status: ConsentStatus): void {
    for (const listener of this.listeners) {
      listener(prefs, status);
    }
  }
}

/** Синглтон — используйте во всём приложении. */
export const consentManager = new ConsentManager();
