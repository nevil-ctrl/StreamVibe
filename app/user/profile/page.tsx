import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Film, Clock, Heart, Rocket } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { getUserWatchStats } from '@/services/watch-history.service';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

function DashboardCard({ title, value, icon: Icon }: DashboardCardProps) {
  return (
    <div className="bg-(--black-08) p-6 rounded-xl border border-(--black-15) flex gap-4 items-center hover:border-(--red-45)/50 transition-all">
      <div className="p-3 bg-(--black-06) rounded-lg text-(--red-45)">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-(--grey-60) text-sm">{title}</p>
        <p className="text-lg font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Просмотрено"
          value={`${stats.totalWatched} тайтлов`}
          icon={Film}
        />
        <DashboardCard
          title="Завершено"
          value={`${stats.completed} тайтлов`}
          icon={Clock}
        />
        <DashboardCard
          title="В избранном"
          value={
            stats.favorites > 0
              ? `${stats.favorites} тайтлов`
              : 'Пусто'
          }
          icon={Heart}
        />
      </div>
    </div>
  );
}
