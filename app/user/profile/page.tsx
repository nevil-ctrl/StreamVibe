import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Film, Clock, Heart, ListPlus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { getUserWatchStats } from '@/services/watch-history.service';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

function DashboardCard({ title, value, icon: Icon, href }: DashboardCardProps) {
  const content = (
    <div className="bg-(--black-08) p-6 rounded-xl border border-(--black-15) flex gap-4 items-center hover:border-(--red-45)/50 transition-all h-full">
      <div className="p-3 bg-(--black-06) rounded-lg text-(--red-45)">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-(--grey-60) text-sm">{title}</p>
        <p className="text-lg font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default async function ProfileDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: true,
    },
  });

  if (!user) redirect('/auth/login');

  const stats = await getUserWatchStats(user.id);

  return (
    <div className="space-y-10 p-8">
      <div className="p-8 rounded-2xl bg-(--black-08) border border-(--black-15)">
        <h1 className="text-3xl font-bold text-white">
          Привет, {user.name ?? 'пользователь'}!
        </h1>
        <p className="text-(--grey-60) mt-2">
          {user.subscription
            ? `Подписка: ${user.subscription.plan} — активна до ${new Date(user.subscription.expiresAt).toLocaleDateString('ru-RU')}`
            : 'У вас пока нет активной подписки'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Просмотрено"
          value={`${stats.totalWatched} тайтлов`}
          icon={Film}
          href="/user/watched"
        />
        <DashboardCard
          title="Завершено"
          value={`${stats.completed} тайтлов`}
          icon={Clock}
          href="/user/history"
        />
        <DashboardCard
          title="В избранном"
          value={
            stats.favorites > 0
              ? `${stats.favorites} тайтлов`
              : 'Пусто'
          }
          icon={Heart}
          href="/user/favorites"
        />
        <DashboardCard
          title="Мой список"
          value={
            stats.watchlist > 0
              ? `${stats.watchlist} тайтлов`
              : 'Пусто'
          }
          icon={ListPlus}
          href="/user/my-list"
        />
      </div>
    </div>
  );
}
