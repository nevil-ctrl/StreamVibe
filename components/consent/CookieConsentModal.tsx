'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ConsentPreferences } from '@/lib/consent/types';
import './cookie-consent.css';

interface CategoryConfig {
  id: keyof Pick<
    ConsentPreferences,
    'functional' | 'analytics' | 'personalization'
  >;
  title: string;
  description: string;
  items: string[];
  locked?: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'essential' as never,
    title: 'Необходимые',
    description: 'Обязательные для работы сайта. Нельзя отключить.',
    items: ['Авторизация', 'Безопасность', 'Работа сайта'],
    locked: true,
  },
  {
    id: 'functional',
    title: 'Функциональные',
    description: 'Улучшают работу с контентом и интерфейсом.',
    items: ['Избранное', 'История просмотров', 'Настройки интерфейса'],
  },
  {
    id: 'analytics',
    title: 'Аналитические',
    description: 'Помогают понять, как используется платформа.',
    items: ['PageView трекинг', 'Поведенческая аналитика', 'PostHog events'],
  },
  {
    id: 'personalization',
    title: 'Персонализация',
    description: 'Персональные рекомендации на основе просмотров.',
    items: ['Рекомендации фильмов', 'Анализ просмотров'],
  },
];

interface CookieConsentModalProps {
  open: boolean;
  initialPrefs: ConsentPreferences | null;
  onSave: (prefs: {
    functional: boolean;
    analytics: boolean;
    personalization: boolean;
  }) => void;
  onAcceptAll: () => void;
  onClose: () => void;
}

function ConsentToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`cookie-consent-toggle ${checked ? 'cookie-consent-toggle--on' : 'cookie-consent-toggle--off'}`}>
      <span className="cookie-consent-toggle-knob" />
    </button>
  );
}

export default function CookieConsentModal({
  open,
  initialPrefs,
  onSave,
  onAcceptAll,
  onClose,
}: CookieConsentModalProps) {
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    if (open) {
      setFunctional(initialPrefs?.functional ?? false);
      setAnalytics(initialPrefs?.analytics ?? false);
      setPersonalization(initialPrefs?.personalization ?? false);
    }
  }, [open, initialPrefs]);

  if (!open) return null;

  return (
    <div
      className="cookie-consent-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cookie-consent-modal relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#262628] bg-[#1A1A1A] shadow-xl">
        <div className="flex items-start justify-between border-b border-[#262628] px-5 py-4 md:px-6">
          <div>
            <h2
              id="cookie-settings-title"
              className="text-lg font-bold text-white md:text-xl">
              Настройки cookie
            </h2>
            <p className="mt-1 text-sm text-[#999999]">
              Выберите, какие данные мы можем использовать
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[#999999] transition hover:bg-[#262628] hover:text-white"
            aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 md:px-6">
          {CATEGORIES.map((cat) => {
            const isLocked = cat.locked;
            const stateMap = {
              functional: [functional, setFunctional] as const,
              analytics: [analytics, setAnalytics] as const,
              personalization: [personalization, setPersonalization] as const,
            };
            const [value, setter] = isLocked
              ? [true, undefined]
              : stateMap[cat.id as keyof typeof stateMap];

            return (
              <div
                key={cat.title}
                className="rounded-xl border border-[#262628] bg-[#141414] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{cat.title}</h3>
                  <ConsentToggle
                    checked={Boolean(value)}
                    disabled={isLocked}
                    onChange={setter}
                    label={cat.title}
                  />
                </div>
                <p className="mb-3 text-sm text-[#999999]">{cat.description}</p>
                <ul className="space-y-1">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[#E50000]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t border-[#262628] px-5 py-4 sm:flex-row sm:justify-end md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#262628] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#262628]">
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({ functional, analytics, personalization })
            }
            className="rounded-lg border border-[#262628] bg-[#262628] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333333]">
            Сохранить выбор
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-lg bg-[#E50000] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
