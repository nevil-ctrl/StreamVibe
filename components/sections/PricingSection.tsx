'use client';

import { useState } from 'react';
import { Check, X, Crown, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BillingCycle = 'monthly' | 'yearly';

const PLANS = [
  {
    id: 'BASIC',
    name: 'Basic Plan',
    monthlyPrice: 0.25,
    description:
      'Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.',
    icon: <Zap size={16} />,
    color: '#B3B3B3',
    features: [
      { text: '1 device simultaneously', included: true },
      { text: 'SD quality', included: true },
      { text: 'No HDR / Dolby Atmos', included: false },
      { text: 'Ads included', included: false },
    ],
  },
  {
    id: 'STANDARD',
    name: 'Standard Plan',
    monthlyPrice: 0.25,
    description:
      'Access to a wider selection of movies and shows, including most new releases and exclusive content',
    popular: true,
    icon: <Star size={16} />,
    color: '#E50000',
    features: [
      { text: '2 devices simultaneously', included: true },
      { text: 'HD + HDR quality', included: true },
      { text: 'Ad-free', included: true },
      { text: 'Offline (select titles)', included: true },
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium Plan',
    monthlyPrice: 0.25,
    description:
      'Access to a widest selection of movies and shows, including all new releases and Offline Viewing',
    icon: <Crown size={16} />,
    color: '#FFB800',
    features: [
      { text: '4 devices simultaneously', included: true },
      { text: '4K + Dolby Atmos', included: true },
      { text: 'Ad-free', included: true },
      { text: 'Offline (all titles) + Family sharing', included: true },
    ],
  },
];

function getYearlyPrice(monthly: number) {
  return (monthly * 12 * 0.8).toFixed(2);
}

export default function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const router = useRouter();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                Choose the plan that&apos;s right for you
              </h2>
              <p className="text-[#999] text-sm leading-relaxed">
                Join StreamVibe and select from our flexible subscription
                options tailored to suit your viewing preferences. Get ready for
                non-stop entertainment!
              </p>
            </div>

            <div className="flex items-center gap-1 self-start bg-[#1A1A1A] border border-[#262628] rounded-lg p-1 shrink-0">
              {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all capitalize cursor-pointer ${
                    billing === cycle
                      ? 'bg-[#262628] text-white'
                      : 'text-[#999] hover:text-white'
                  }`}>
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
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
                      Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: plan.color }}>{plan.icon}</span>
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="text-[#999] text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${price}
                  </span>
                  <span className="text-[#999] text-sm">
                    /{billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-center gap-2 text-sm ${f.included ? 'text-[#B3B3B3]' : 'text-[#4C4C4C]'}`}>
                      {f.included ? (
                        <Check size={13} className="text-[#E50000] shrink-0" />
                      ) : (
                        <X size={13} className="shrink-0" />
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => router.push('/subscriptions')}
                    className="flex-1 py-2.5 rounded-lg border border-[#333] text-white text-sm font-medium hover:bg-[#262628] transition-colors cursor-pointer">
                    Start Free Trial
                  </button>
                  <button
                    onClick={() => router.push('/subscriptions')}
                    className="flex-1 py-2.5 rounded-lg bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors cursor-pointer">
                    Choose Plan
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
