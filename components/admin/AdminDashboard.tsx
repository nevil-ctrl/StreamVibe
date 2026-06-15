'use client';
import { useEffect, useState } from 'react';
import {
  Users,
  DollarSign,
  Eye,
  Ticket,
  TrendingUp,
  TrendingDown,
  Film,
  Tv,
  Ban,
  LucideIcon,
} from 'lucide-react';

interface Stats {
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
}

interface DashboardData {
  stats: Stats;
  charts: {
    userRegistrations: { date: string; count: number }[];
    pageViews: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
  };
  top: {
    movies: { id: string; title: string; count: number }[];
    shows: { id: string; name: string; count: number }[];
  };
}

function StatCard({
  title,
  value,
  sub,
  growth,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  sub?: string;
  growth?: number;
  icon: LucideIcon;
  color: string;
}) {
  const isPositive = (growth ?? 0) >= 0;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        {growth !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/50">{title}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function MiniChart({
  data,
  color = '#ef4444',
}: {
  data: number[];
  color?: string;
}) {
  if (!data.length)
    return (
      <div className="h-16 flex items-center justify-center text-white/20 text-xs">
        Нет данных
      </div>
    );
  const max = Math.max(...data, 1);
  return (
    <div className="h-16 flex items-end gap-0.5">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white/10 rounded-xl animate-pulse"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-white/50">Ошибка загрузки</div>;

  const { stats, charts, top } = data;

  // Последние 30 дней для графиков (заполняем пропуски нулями)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const viewsData = last30Days.map(
    (d) => charts.pageViews.find((v) => v.date === d)?.count ?? 0,
  );
  const usersData = last30Days.map(
    (d) => charts.userRegistrations.find((v) => v.date === d)?.count ?? 0,
  );
  const revenueData = last30Days.map(
    (d) => charts.revenue.find((v) => v.date === d)?.amount ?? 0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Привет, {adminName} 👋
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Вот что происходит на платформе
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего пользователей"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsersThisMonth} в этом месяце`}
          growth={stats.usersGrowth}
          icon={Users}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          title="Выручка (месяц)"
          value={`$${stats.revenueThisMonth.toFixed(2)}`}
          sub={`Всего $${stats.totalRevenue.toFixed(2)}`}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-green-500/20 text-green-400"
        />
        <StatCard
          title="Просмотры (месяц)"
          value={stats.pageViewsThisMonth.toLocaleString()}
          growth={stats.viewsGrowth}
          icon={Eye}
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          title="Активные подписки"
          value={stats.activeSubscriptions.toLocaleString()}
          icon={TrendingUp}
          color="bg-yellow-500/20 text-yellow-400"
        />
        <StatCard
          title="Просмотрено контента"
          value={stats.totalWatched.toLocaleString()}
          icon={Film}
          color="bg-red-500/20 text-red-400"
        />
        <StatCard
          title="Открытых тикетов"
          value={stats.openTickets}
          icon={Ticket}
          color="bg-orange-500/20 text-orange-400"
        />
        <StatCard
          title="Заблокировано"
          value={stats.bannedUsers}
          icon={Ban}
          color="bg-red-900/40 text-red-400"
        />
        <StatCard
          title="Всего просмотров"
          value={stats.totalWatched.toLocaleString()}
          icon={Tv}
          color="bg-cyan-500/20 text-cyan-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-1">Просмотры страниц</h3>
          <p className="text-white/30 text-xs mb-4">Последние 30 дней</p>
          <MiniChart data={viewsData} color="#a855f7" />
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-1">Новые пользователи</h3>
          <p className="text-white/30 text-xs mb-4">Последние 30 дней</p>
          <MiniChart data={usersData} color="#3b82f6" />
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-1">Выручка ($)</h3>
          <p className="text-white/30 text-xs mb-4">Последние 30 дней</p>
          <MiniChart data={revenueData} color="#22c55e" />
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Film size={16} className="text-red-400" /> Топ фильмы
          </h3>
          {top.movies.length === 0 ? (
            <p className="text-white/30 text-sm">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {top.movies.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-white/30 text-sm w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{m.title}</p>
                  </div>
                  <span className="text-white/50 text-sm">
                    {m.count} просм.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Tv size={16} className="text-blue-400" /> Топ сериалы
          </h3>
          {top.shows.length === 0 ? (
            <p className="text-white/30 text-sm">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {top.shows.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-white/30 text-sm w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{s.name}</p>
                  </div>
                  <span className="text-white/50 text-sm">
                    {s.count} просм.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
