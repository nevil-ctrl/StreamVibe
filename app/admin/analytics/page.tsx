'use client';

import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface ChartData {
  date: string;
  count?: number;
  amount?: number;
}

interface AnalyticsData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    usersGrowth: number;
    bannedUsers: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueGrowth: number;
    activeSubscriptions: number;
    totalWatched: number;
    openTickets: number;
    pageViewsThisMonth: number;
    viewsGrowth: number;
  };
  charts: {
    userRegistrations: ChartData[];
    pageViews: ChartData[];
    revenue: ChartData[];
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">
          Ошибка загрузки аналитики
        </h2>
        <p className="text-sm opacity-80">
          Не удалось получить данные с сервера. Убедитесь, что вы авторизованы
          под учетной записью администратора или суперадминистратора.
        </p>
      </div>
    );
  }

  const { stats, charts } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Аналитика платформы
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Полный обзор активности пользователей, просмотров и финансовых
          показателей.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <p className="text-sm text-neutral-400 font-medium">
              Общая выручка
            </p>
            <LucideIcons.DollarSign className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.revenueGrowth >= 0 ? '+' : ''}
            {stats.revenueGrowth}%{' '}
            <span className="text-neutral-500">к прошлому месяцу</span>
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <p className="text-sm text-neutral-400 font-medium">Пользователи</p>
            <LucideIcons.Users className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.totalUsers.toLocaleString()}
          </p>
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${stats.usersGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.usersGrowth >= 0 ? '+' : ''}
            {stats.usersGrowth}%{' '}
            <span className="text-neutral-500">новых в этом месяце</span>
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <p className="text-sm text-neutral-400 font-medium">
              Просмотры страниц
            </p>
            <LucideIcons.Eye className="text-purple-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.pageViewsThisMonth.toLocaleString()}
          </p>
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${stats.viewsGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.viewsGrowth >= 0 ? '+' : ''}
            {stats.viewsGrowth}%{' '}
            <span className="text-neutral-500">динамика трафика</span>
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <p className="text-sm text-neutral-400 font-medium">
              Активные подписки
            </p>
            <LucideIcons.CreditCard className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {stats.activeSubscriptions.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <LucideIcons.ShieldAlert className="w-3 h-3 text-red-500" />{' '}
            {stats.bannedUsers} заблокировано
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/30 border border-neutral-800/80 p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <LucideIcons.TrendingUp className="w-4 h-4 text-red-500" /> Новые
            регистрации (30 дней)
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {charts?.userRegistrations?.length > 0 ? (
              charts.userRegistrations.map((item) => (
                <div
                  key={item.date}
                  className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                  <span className="text-sm text-neutral-400">{item.date}</span>
                  <span className="text-sm font-semibold text-white">
                    +{item.count} чел.
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                Нет данных за указанный период
              </p>
            )}
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800/80 p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <LucideIcons.Activity className="w-4 h-4 text-purple-500" />{' '}
            Просмотры страниц по дням
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {charts?.pageViews?.length > 0 ? (
              charts.pageViews.map((item) => (
                <div
                  key={item.date}
                  className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                  <span className="text-sm text-neutral-400">{item.date}</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {item.count} просмотров
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                Нет данных за указанный период
              </p>
            )}
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800/80 p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <LucideIcons.Coins className="w-4 h-4 text-emerald-500" /> График
            доходов за последние дни
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {charts?.revenue?.length > 0 ? (
              charts.revenue.map((item) => (
                <div
                  key={item.date}
                  className="bg-neutral-900/80 border border-neutral-800/60 p-3 rounded-xl text-center">
                  <p className="text-xs text-neutral-500">
                    {item.date.split('-').slice(1).reverse().join('.')}
                  </p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    ${item.amount}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 col-span-full py-4">
                История успешных платежей пуста
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
