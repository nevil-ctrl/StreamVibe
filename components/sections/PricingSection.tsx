'use client';

import { useState } from 'react';
import { Check, X, Crown, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/providers/LocaleProvider';
import type { MessageKey } from '@/lib/i18n/types';

type BillingCycle = 'monthly' | 'yearly';

const PLAN_CONFIG = [
  {
    id: 'BASIC',
    nameKey: 'pricing.basicPlan' as MessageKey,
    descKey: 'pricing.basicDesc' as MessageKey,
    monthlyPrice: 0.25,
    icon: <Zap size={16} />,
    color: '#B3B3B3',
    featureKeys: [
      { key: 'pricing.feat1Device' as MessageKey, included: true },
      { key: 'pricing.featSd' as MessageKey, included: true },
      { key: 'pricing.featNoHdr' as MessageKey, included: false },
      { key: 'pricing.featAds' as MessageKey, included: false },
    ],
  },
  {
    id: 'STANDARD',
    nameKey: 'pricing.standardPlan' as MessageKey,
    descKey: 'pricing.standardDesc' as MessageKey,
    monthlyPrice: 0.25,
    popular: true,
    icon: <Star size={16} />,
    color: '#E50000',
    featureKeys: [
      { key: 'pricing.feat2Devices' as MessageKey, included: true },
      { key: 'pricing.featHdHdr' as MessageKey, included: true },
      { key: 'pricing.featAdFree' as MessageKey, included: true },
      { key: 'pricing.featOfflineSelect' as MessageKey, included: true },
    ],
  },
  {
    id: 'PREMIUM',
    nameKey: 'pricing.premiumPlan' as MessageKey,
    descKey: 'pricing.premiumDesc' as MessageKey,
    monthlyPrice: 0.25,
    icon: <Crown size={16} />,
    color: '#FFB800',
    featureKeys: [
      { key: 'pricing.feat4Devices' as MessageKey, included: true },
      { key: 'pricing.feat4k' as MessageKey, included: true },
      { key: 'pricing.featAdFree' as MessageKey, included: true },
      { key: 'pricing.featOfflineAll' as MessageKey, included: true },
    ],
  },
];

function getYearlyPrice(monthly: number) {
  return (monthly * 12 * 0.8).toFixed(2);
}

export default function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const router = useRouter();
  const t = useTranslations();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {t('pricing.title')}
              </h2>
              <p className="text-[#999] text-sm leading-relaxed">
                {t('pricing.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-1 self-start bg-[#1A1A1A] border border-[#262628] rounded-lg p-1 shrink-0">
              {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    billing === cycle
                      ? 'bg-[#262628] text-white'
                      : 'text-[#999] hover:text-white'
                  }`}>
                  {cycle === 'monthly' ? t('pricing.monthly') : t('pricing.yearly')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_CONFIG.map((plan) => {
            const price =
              billing === 'monthly'
                ? plan.monthlyPrice.toFixed(2)
                : getYearlyPrice(plan.monthlyPrice);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                  plan.popular
                    ? 'border-[#E50000]/30 bg-gradient-to-b from-[#1F1F1F] to-[#1A1A1A]'
                    : 'border-[#262628] bg-[#141414] hover:border-[#333]'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#E50000] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {t('pricing.mostPopular')}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: plan.color }}>{plan.icon}</span>
                    <h3 className="text-lg font-semibold text-white">
                      {t(plan.nameKey)}
                    </h3>
                  </div>
                  <p className="text-[#999] text-sm leading-relaxed">
                    {t(plan.descKey)}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${price}
                  </span>
                  <span className="text-[#999] text-sm">
                    {billing === 'monthly'
                      ? t('pricing.perMonth')
                      : t('pricing.perYear')}
                  </span>
                </div>

                <ul className="flex flex-col gap-2">
                  {plan.featureKeys.map((f) => (
                    <li
                      key={f.key}
                      className={`flex items-center gap-2 text-sm ${f.included ? 'text-[#B3B3B3]' : 'text-[#4C4C4C]'}`}>
                      {f.included ? (
                        <Check size={13} className="text-[#E50000] shrink-0" />
                      ) : (
                        <X size={13} className="shrink-0" />
                      )}
                      {t(f.key)}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => router.push('/subscriptions')}
                    className="flex-1 py-2.5 rounded-lg border border-[#333] text-white text-sm font-medium hover:bg-[#262628] transition-colors cursor-pointer">
                    {t('pricing.startFreeTrial')}
                  </button>
                  <button
                    onClick={() => router.push('/subscriptions')}
                    className="flex-1 py-2.5 rounded-lg bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors cursor-pointer">
                    {t('pricing.choosePlan')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
