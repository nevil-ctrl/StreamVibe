'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X, Loader2, Crown, Zap, Star } from 'lucide-react';

type Plan = 'BASIC' | 'STANDARD' | 'PREMIUM';
type BillingCycle = 'monthly' | 'yearly';

interface Props {
  currentPlan: string | null;
  subscriptionStatus: string | null;
  expiresAt: string | null;
  isLoggedIn: boolean;
}

interface PlanConfig {
  id: Plan;
  name: string;
  monthlyPrice: number;
  description: string;
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const PLANS: PlanConfig[] = [
  {
    id: 'BASIC',
    name: 'Basic Plan',
    monthlyPrice: 0.25,
    description:
      'Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.',
    icon: <Zap size={16} />,
    color: '#B3B3B3',
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
  },
  {
    id: 'PREMIUM',
    name: 'Premium Plan',
    monthlyPrice: 0.25,
    description:
      'Access to a widest selection of movies and shows, including all new releases and Offline Viewing',
    icon: <Crown size={16} />,
    color: '#FFB800',
  },
];

type FeatureValue = string | boolean;

const COMPARE_ROWS: {
  feature: string;
  basic: FeatureValue;
  standard: FeatureValue;
  premium: FeatureValue;
}[] = [
  {
    feature: 'Price',
    basic: '$0.25/Month',
    standard: '$0.25/Month',
    premium: '$0.25/Month',
  },
  {
    feature: 'Content',
    basic:
      'Access to a wide selection of movies and shows, including some new releases.',
    standard:
      'Access to a wider selection of movies and shows, including most new releases and exclusive content.',
    premium:
      'Access to a widest selection of movies and shows, including all new releases and Offline Viewing.',
  },
  {
    feature: 'Devices',
    basic: 'Watch on one device simultaneously',
    standard: 'Watch on Two device simultaneously',
    premium: 'Watch on Four device simultaneously',
  },
  {
    feature: 'Free Trial',
    basic: '7 Days',
    standard: '7 Days',
    premium: '7 Days',
  },
  { feature: 'Cancel Anytime', basic: true, standard: true, premium: true },
  { feature: 'HDR', basic: false, standard: true, premium: true },
  { feature: 'Dolby Atmos', basic: false, standard: true, premium: true },
  { feature: 'Ad-Free', basic: false, standard: true, premium: true },
  {
    feature: 'Offline Viewing',
    basic: false,
    standard: 'Yes, for select titles.',
    premium: 'Yes, for all titles.',
  },
  {
    feature: 'Family Sharing',
    basic: false,
    standard: 'Yes, up to 5 family members.',
    premium: 'Yes, up to 6 family members.',
  },
];

function renderCell(val: FeatureValue) {
  if (val === true)
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E50000]/15 text-[#E50000]">
        <Check size={11} strokeWidth={3} />
      </span>
    );
  if (val === false) return <span className="text-[#4C4C4C] text-sm">No</span>;
  return <span className="text-[#B3B3B3] text-sm leading-snug">{val}</span>;
}

function getYearlyPrice(monthly: number) {
  return (monthly * 12 * 0.8).toFixed(2);
}

export default function SubscriptionsClient({
  currentPlan,
  subscriptionStatus,
  expiresAt,
  isLoggedIn,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [, startTransition] = useTransition();

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const successPlan = searchParams.get('plan');

  const isActivePlan = (planId: Plan) =>
    currentPlan === planId && subscriptionStatus === 'ACTIVE';

  const hasActiveSub = subscriptionStatus === 'ACTIVE' && currentPlan;

  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        startTransition(() => router.replace('/subscriptions'));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, router]);

  async function handleChoosePlan(planId: Plan) {
    if (!isLoggedIn) {
      router.push('/auth/login?callbackUrl=/subscriptions');
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingPlan(null);
      }
    } catch {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {success && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1A1A1A] border border-[#333] text-white px-5 py-3 rounded-xl shadow-2xl text-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E50000]/15 text-[#E50000]">
            <Check size={11} strokeWidth={3} />
          </span>
          <span>
            <strong>
              {successPlan
                ? `${successPlan.charAt(0) + successPlan.slice(1).toLowerCase()} Plan`
                : 'Subscription'}
            </strong>{' '}
            activated! Enjoy StreamVibe.
          </span>
        </div>
      )}
      {canceled && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1A1A1A] border border-[#333] text-white px-5 py-3 rounded-xl shadow-2xl text-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#333] text-[#999]">
            <X size={11} strokeWidth={3} />
          </span>
          Payment was canceled.
        </div>
      )}

      <div className="container px-4 py-16 md:py-20">
        {hasActiveSub && (
          <div className="mb-10 flex items-center justify-between bg-[#141414] border border-[#E50000]/30 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E50000]/10 text-[#E50000]">
                <Crown size={18} />
              </span>
              <div>
                <p className="text-white font-semibold text-sm">
                  You are on the{' '}
                  <span className="text-[#E50000]">
                    {currentPlan!.charAt(0) +
                      currentPlan!.slice(1).toLowerCase()}{' '}
                    Plan
                  </span>
                </p>
                {expiresAt && (
                  <p className="text-[#666] text-xs mt-0.5">
                    Renews on{' '}
                    {new Date(expiresAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs bg-[#E50000]/10 text-[#E50000] border border-[#E50000]/20 px-3 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
        )}

        {/* Заголовок + тоггл */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12">
          <div className="lex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Choose the plan that&apos;s right for you
            </h1>
            <p className="text-[#999] text-sm leading-relaxed">
              Join StreamVibe and select from our flexible subscription options
              tailored to suit your viewing preferences. Get ready for non-stop
              entertainment!
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

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {PLANS.map((plan) => {
            const price =
              billing === 'monthly'
                ? plan.monthlyPrice.toFixed(2)
                : getYearlyPrice(plan.monthlyPrice);
            const isActive = isActivePlan(plan.id);
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                  isActive
                    ? 'border-[#E50000]/60 bg-gradient-to-b from-[#1F1F1F] to-[#1A1A1A] shadow-[0_0_30px_rgba(229,0,0,0.08)]'
                    : plan.popular
                      ? 'border-[#E50000]/30 bg-gradient-to-b from-[#1F1F1F] to-[#1A1A1A]'
                      : 'border-[#262628] bg-[#141414] hover:border-[#333]'
                }`}>
                {/* Бейдж "Your Plan" */}
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1.5 bg-[#E50000] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      <Crown size={11} />
                      Your Plan
                    </span>
                  </div>
                )}

                {/* Бейдж Popular */}
                {plan.popular && !isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#E50000] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: plan.color }}>{plan.icon}</span>
                    <h2 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h2>
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

                {/* Фичи плана */}
                <ul className="flex flex-col gap-2">
                  {plan.id === 'BASIC' && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />1
                        device simultaneously
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        SD quality
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#4C4C4C]">
                        <X size={13} className="shrink-0" />
                        No HDR / Dolby Atmos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#4C4C4C]">
                        <X size={13} className="shrink-0" />
                        Ads included
                      </li>
                    </>
                  )}
                  {plan.id === 'STANDARD' && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />2
                        devices simultaneously
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        HD + HDR quality
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        Ad-free
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        Offline (select titles)
                      </li>
                    </>
                  )}
                  {plan.id === 'PREMIUM' && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />4
                        devices simultaneously
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        4K + Dolby Atmos
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        Ad-free
                      </li>
                      <li className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                        <Check size={13} className="text-[#E50000] shrink-0" />
                        Offline (all titles) + Family sharing
                      </li>
                    </>
                  )}
                </ul>

                <div className="flex gap-3 mt-auto">
                  {isActive ? (
                    <button
                      disabled
                      className="flex-1 py-2.5 rounded-lg border border-[#E50000]/30 text-[#E50000] text-sm font-medium cursor-default flex items-center justify-center gap-2">
                      <Crown size={13} />
                      Current Plan
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleChoosePlan(plan.id)}
                        disabled={!!loadingPlan}
                        className="flex-1 py-2.5 rounded-lg border border-[#333] text-white text-sm font-medium hover:bg-[#262628] transition-colors cursor-pointer disabled:opacity-50">
                        Start Free Trial
                      </button>
                      <button
                        onClick={() => handleChoosePlan(plan.id)}
                        disabled={!!loadingPlan}
                        className="flex-1 py-2.5 rounded-lg bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Loading...
                          </>
                        ) : hasActiveSub ? (
                          'Switch Plan'
                        ) : (
                          'Choose Plan'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Compare our plans and find the right one for you
          </h2>
          <p className="text-[#999] text-sm leading-relaxed max-w-[1000px]">
            StreamVibe offers three different plans to fit your needs: Basic,
            Standard, and Premium. Compare the features of each plan and choose
            the one that&apos;s right for you.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F1F]">
                <th className="py-4 px-6 text-[#999] text-sm font-medium w-[200px]">
                  Features
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className="py-4 px-6 text-white text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      {plan.name.replace(' Plan', '')}
                      {isActivePlan(plan.id) && (
                        <span className="text-xs bg-[#E50000] text-white px-2 py-0.5 rounded-md font-medium">
                          Your Plan
                        </span>
                      )}
                      {plan.popular && !isActivePlan(plan.id) && (
                        <span className="text-xs bg-[#E50000] text-white px-2 py-0.5 rounded-md font-medium">
                          Popular
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-[#1A1A1A] ${i % 2 === 0 ? 'bg-[#141414]' : 'bg-[#0F0F0F]'}`}>
                  <td className="py-4 px-6 text-[#999] text-sm font-medium whitespace-nowrap">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6">{renderCell(row.basic)}</td>
                  <td className="py-4 px-6">{renderCell(row.standard)}</td>
                  <td className="py-4 px-6">{renderCell(row.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
