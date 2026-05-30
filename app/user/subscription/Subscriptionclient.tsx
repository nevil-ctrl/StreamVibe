'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Star,
  X,
  ChevronRight,
  Receipt,
} from 'lucide-react';

// ─── типы ────────────────────────────────────────────────────────────────────

interface SubData {
  plan: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface PaymentData {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Props {
  subscription: SubData | null;
  payments: PaymentData[];
  userEmail: string | null | undefined;
}

// ─── конфиги ─────────────────────────────────────────────────────────────────

const PLAN_ICONS: Record<string, React.ReactNode> = {
  BASIC: <Zap size={14} />,
  STANDARD: <Star size={14} />,
  PREMIUM: <Crown size={14} />,
};

const PLAN_COLORS: Record<string, string> = {
  BASIC: 'text-[#B3B3B3] bg-[#B3B3B3]/10',
  STANDARD: 'text-[#E50000] bg-[#E50000]/10',
  PREMIUM: 'text-[#FFB800] bg-[#FFB800]/10',
};

const PLAN_DETAILS: Record<
  string,
  { devices: string; quality: string; ads: string; offline: string }
> = {
  BASIC: { devices: '1', quality: 'SD', ads: 'Нет', offline: 'Нет' },
  STANDARD: { devices: '2', quality: 'HD + HDR', ads: 'Да', offline: 'Часть' },
  PREMIUM: { devices: '4', quality: '4K + Dolby', ads: 'Да', offline: 'Всё' },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  SUCCESS: {
    label: 'Успешно',
    icon: <CheckCircle size={13} />,
    className: 'text-green-400 bg-green-400/10',
  },
  FAILED: {
    label: 'Ошибка',
    icon: <XCircle size={13} />,
    className: 'text-red-400 bg-red-400/10',
  },
  PENDING: {
    label: 'Ожидание',
    icon: <Clock size={13} />,
    className: 'text-yellow-400 bg-yellow-400/10',
  },
};

const SUB_STATUS_CONFIG: Record<string, { label: string; className: string }> =
  {
    ACTIVE: {
      label: 'Активна',
      className: 'text-green-400 bg-green-400/10 border-green-400/20',
    },
    CANCELLED: {
      label: 'Отменена',
      className: 'text-[#999] bg-[#999]/10 border-[#999]/20',
    },
    EXPIRED: {
      label: 'Истекла',
      className: 'text-red-400 bg-red-400/10 border-red-400/20',
    },
  };

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString(
    'ru-RU',
    opts ?? {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(cents: number, currency: string) {
  return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function planLabel(plan: string) {
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

// ─── Drawer ──────────────────────────────────────────────────────────────────

function PaymentDrawer({
  payment,
  userEmail,
  onClose,
}: {
  payment: PaymentData;
  userEmail: string | null | undefined;
  onClose: () => void;
}) {
  const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING;
  const planColor = PLAN_COLORS[payment.plan] ?? PLAN_COLORS.BASIC;
  const planIcon = PLAN_ICONS[payment.plan] ?? PLAN_ICONS.BASIC;

  // Период подписки: дата оплаты → +1 месяц
  const paidAt = new Date(payment.createdAt);
  const periodEnd = new Date(paidAt);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F0F0F] border-l border-[#1F1F1F] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E50000]/10 text-[#E50000] flex items-center justify-center">
              <Receipt size={16} />
            </div>
            <h2 className="text-white font-semibold">Детали платежа</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1F1F1F] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Статус + сумма */}
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 text-center">
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 ${statusCfg.className}`}>
              {statusCfg.icon}
              {statusCfg.label}
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              ${(payment.amount / 100).toFixed(2)}
            </p>
            <p className="text-[#666] text-sm">
              {payment.currency.toUpperCase()}
            </p>
          </div>

          {/* Детали */}
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
            {[
              {
                label: 'ID транзакции',
                value: payment.id.slice(0, 20) + '...',
                mono: true,
              },
              {
                label: 'Дата оплаты',
                value: `${formatDate(payment.createdAt)} в ${formatTime(payment.createdAt)}`,
              },
              {
                label: 'План',
                value: (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${planColor}`}>
                    {planIcon}
                    {planLabel(payment.plan)}
                  </span>
                ),
              },
              {
                label: 'Сумма',
                value: formatAmount(payment.amount, payment.currency),
              },
              { label: 'Email', value: userEmail ?? '—' },
              {
                label: 'Период',
                value: `${formatDate(payment.createdAt, { day: 'numeric', month: 'short' })} — ${formatDate(periodEnd.toISOString(), { day: 'numeric', month: 'short', year: 'numeric' })}`,
              },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 ${i !== arr.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
                <span className="text-[#666] text-sm">{row.label}</span>
                {typeof row.value === 'string' ? (
                  <span
                    className={`text-white text-sm font-medium text-right max-w-[55%] truncate ${(row as { mono?: boolean }).mono ? 'font-mono text-xs text-[#999]' : ''}`}>
                    {row.value}
                  </span>
                ) : (
                  row.value
                )}
              </div>
            ))}
          </div>

          {/* Что включено в план */}
          {PLAN_DETAILS[payment.plan] && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#666] font-bold mb-3">
                Что включено
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PLAN_DETAILS[payment.plan]).map(
                  ([key, val]) => {
                    const labels: Record<string, string> = {
                      devices: 'Устройств',
                      quality: 'Качество',
                      ads: 'Без рекламы',
                      offline: 'Оффлайн',
                    };
                    return (
                      <div
                        key={key}
                        className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-3">
                        <p className="text-[#666] text-xs mb-1">
                          {labels[key]}
                        </p>
                        <p className="text-white text-sm font-semibold">
                          {val}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="px-6 py-4 border-t border-[#1F1F1F]">
          <Link
            href="/subscriptions"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors">
            Изменить план
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Основной компонент ───────────────────────────────────────────────────────

export default function SubscriptionClient({
  subscription,
  payments,
  userEmail,
}: Props) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(
    null,
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Подписка</h1>
        <p className="text-[#666] text-sm">
          Управление подпиской и история платежей
        </p>
      </div>

      {/* Текущий план */}
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-[#666] font-bold mb-4">
          Текущий план
        </h2>

        {subscription ? (
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${PLAN_COLORS[subscription.plan] ?? PLAN_COLORS.BASIC}`}>
                  <span className="scale-150">
                    {PLAN_ICONS[subscription.plan]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-lg">
                      {planLabel(subscription.plan)} Plan
                    </h3>
                    {SUB_STATUS_CONFIG[subscription.status] && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SUB_STATUS_CONFIG[subscription.status].className}`}>
                        {SUB_STATUS_CONFIG[subscription.status].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[#666] text-sm">
                    {subscription.status === 'ACTIVE'
                      ? 'Продлевается'
                      : 'Истекает'}{' '}
                    {formatDate(subscription.expiresAt)}
                  </p>
                </div>
              </div>
              <Link
                href="/subscriptions"
                className="shrink-0 px-4 py-2 rounded-xl bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors">
                Изменить план
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-[#1F1F1F] grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(
                PLAN_DETAILS[subscription.plan] ?? PLAN_DETAILS.BASIC,
              ).map(([key, val]) => {
                const labels: Record<string, string> = {
                  devices: 'Устройства',
                  quality: 'Качество',
                  ads: 'Без рекламы',
                  offline: 'Оффлайн',
                };
                return (
                  <div key={key} className="bg-[#0F0F0F] rounded-xl p-3">
                    <p className="text-[#666] text-xs mb-1">{labels[key]}</p>
                    <p className="text-white text-sm font-semibold">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E50000]/10 text-[#E50000] flex items-center justify-center">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                Нет активной подписки
              </p>
              <p className="text-[#666] text-sm">
                Выберите план чтобы получить доступ ко всему контенту
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="px-5 py-2.5 rounded-xl bg-[#E50000] hover:bg-[#FF0000] text-white text-sm font-semibold transition-colors">
              Выбрать план
            </Link>
          </div>
        )}
      </div>

      {/* История платежей */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#666] font-bold mb-4">
          История платежей
        </h2>

        {payments.length === 0 ? (
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-8 text-center">
            <p className="text-[#666] text-sm">Платежей пока нет</p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-[#1F1F1F]">
              {['Дата', 'План', 'Сумма', 'Статус'].map((h) => (
                <span
                  key={h}
                  className="text-xs uppercase tracking-widest text-[#666] font-bold">
                  {h}
                </span>
              ))}
            </div>

            {payments.map((payment, i) => {
              const statusCfg =
                STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING;
              const planColor = PLAN_COLORS[payment.plan] ?? PLAN_COLORS.BASIC;
              const planIcon = PLAN_ICONS[payment.plan] ?? PLAN_ICONS.BASIC;

              return (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 items-center cursor-pointer group transition-colors hover:bg-[#1A1A1A] ${
                    i !== payments.length - 1 ? 'border-b border-[#1A1A1A]' : ''
                  }`}>
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-[#E50000] transition-colors">
                      {formatDate(payment.createdAt, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[#666] text-xs mt-0.5">
                      {formatTime(payment.createdAt)}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${planColor}`}>
                      {planIcon}
                      {planLabel(payment.plan)}
                    </span>
                  </div>

                  <div>
                    <p className="text-white text-sm font-semibold">
                      ${(payment.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-[#666] text-xs mt-0.5 uppercase">
                      {payment.currency}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[#333] group-hover:text-[#666] transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedPayment && (
        <PaymentDrawer
          payment={selectedPayment}
          userEmail={userEmail}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
