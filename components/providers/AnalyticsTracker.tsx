'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/components/providers/ConsentProvider';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { hasConsent } = useConsent();

  useEffect(() => {
    if (!hasConsent('analytics')) return;

    fetch('/api/metrics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Consent-Given': 'true',
        'X-Consent-Analytics': 'true',
      },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => null);
  }, [pathname, hasConsent]);

  return null;
}
