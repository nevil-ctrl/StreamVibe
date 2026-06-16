'use client';

import { Globe } from 'lucide-react';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { useLocale } from '@/components/providers/LocaleProvider';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'compact',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale, isPending, t } = useLocale();

  if (variant === 'full') {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-sm text-[#666]">{t('language.description')}</p>
        <div className="flex gap-2">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              disabled={isPending}
              onClick={() => setLocale(loc)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition min-h-[44px] cursor-pointer disabled:opacity-50 ${
                locale === loc
                  ? 'bg-[#E50000] text-white'
                  : 'bg-[#1A1A1A] text-[#999] hover:text-white border border-[#262628]'
              }`}>
              <Globe size={16} />
              {t(`language.${loc}`)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center rounded-lg border border-[#262626] bg-[#1A1A1A] p-0.5 ${className}`}
      role="group"
      aria-label={t('language.label')}>
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending}
          onClick={() => setLocale(loc)}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer disabled:opacity-50 min-w-[36px] ${
            locale === loc
              ? 'bg-[#E50000] text-white'
              : 'text-[#999] hover:text-white'
          }`}>
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
