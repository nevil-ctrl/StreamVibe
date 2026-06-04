import { auth } from '@/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function DashboardPage() {
  const session = await auth();
  return <AdminDashboard adminName={session?.user?.name ?? 'Админ'} />;
}
