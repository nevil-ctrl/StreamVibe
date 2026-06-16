'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { consentManager } from '@/lib/consent/consent-manager';
import type { ConsentPreferences } from '@/lib/consent/types';
import { useTranslations } from '@/components/providers/LocaleProvider';
import CookieConsentModal from './CookieConsentModal';
import './cookie-consent.css';

interface CookieConsentProps {
  forceSettings?: boolean;
  onSettingsClose?: () => void;
}

export default function CookieConsent({
  forceSettings = false,
  onSettingsClose,
}: CookieConsentProps) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences | null>(null);

  const dismissBanner = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 300);
  }, []);

  useEffect(() => {
    consentManager.init();
    const current = consentManager.getConsent();
    setPrefs(current);

    if (!consentManager.hasAnswered()) {
      setVisible(true);
    }

    return consentManager.onChange((next) => {
      setPrefs(next);
      dismissBanner();
    });
  }, [dismissBanner]);

  useEffect(() => {
    if (forceSettings) {
      setModalOpen(true);
    }
  }, [forceSettings]);

  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setModalOpen(false);
    onSettingsClose?.();
  };

  const handleEssentialOnly = () => {
    consentManager.rejectNonEssential();
    setModalOpen(false);
    onSettingsClose?.();
  };

  const handleSaveCustom = (custom: {
    functional: boolean;
    analytics: boolean;
    personalization: boolean;
  }) => {
    consentManager.setConsent(custom, 'custom');
    setModalOpen(false);
    onSettingsClose?.();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    onSettingsClose?.();
  };

  return (
    <>
      {visible && (
        <div
          role="region"
          aria-label={t('consent.ariaLabel')}
          className={`cookie-consent-banner fixed inset-x-0 bottom-0 z-50 border-t border-[#262628] bg-[#141414]/95 px-4 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md md:px-8 md:py-5 ${
            exiting ? 'cookie-consent-banner--exit' : ''
          }`}>
          <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex items-start gap-3 md:max-w-3xl">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#262628] text-[#E50000]">
                <Cookie size={18} />
              </div>
              <p className="text-sm leading-relaxed text-[#B3B3B3] md:text-[15px]">
                {t('consent.description')}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-lg border border-[#262628] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#262628]">
                {t('consent.customize')}
              </button>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="rounded-lg border border-[#262628] bg-[#262628] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333333]">
                {t('consent.essentialOnly')}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-lg bg-[#E50000] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                {t('consent.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      )}

      <CookieConsentModal
        open={modalOpen}
        initialPrefs={prefs}
        onSave={handleSaveCustom}
        onAcceptAll={handleAcceptAll}
        onClose={handleCloseModal}
      />
    </>
  );
}

export function ManageCookiesButton() {
  const t = useTranslations();
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenSettings(true)}
        className="hover:text-white transition text-left">
        {t('consent.manageCookies')}
      </button>
      {openSettings && (
        <CookieConsent
          forceSettings
          onSettingsClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
