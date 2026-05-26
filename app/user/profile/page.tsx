import { Film, Clock, Rocket, LucideIcon } from 'lucide-react';

// 1. Создаем интерфейс для пропсов карточки
interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

function DashboardCard({ title, value, icon: Icon }: DashboardCardProps) {
  return (
    <div className="bg-(--black-08) p-6 rounded-xl border border-(--black-15) flex gap-4 items-center group transition-all hover:border-(--red-45)/50">
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
  // Здесь в будущем ты сделаешь запрос: const user = await prisma.user.findUnique(...)
  // Пока оставляем статические данные, но структура готова к подстановке

  return (
    <div className="space-y-10">
      <div className="p-8 rounded-2xl bg-(--black-08) border border-(--black-15)">
        <h1 className="text-3xl font-bold text-white">Привет, пользователь!</h1>
        <p className="text-(--grey-60) mt-2">
          Твой дашборд обновлен. Здесь отображается твоя активность.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Последний фильм"
          value="Интерстеллар"
          icon={Film}
        />
        <DashboardCard title="Всего часов" value="482 ч." icon={Clock} />
        <DashboardCard
          title="Любимый жанр"
          value="Научная фантастика"
          icon={Rocket}
        />
      </div>
    </div>
  );
}
