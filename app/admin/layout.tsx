import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const currentRole = String(session?.user?.role || '').toUpperCase();
  const hasAccess = currentRole === 'ADMIN' || currentRole === 'SUPERADMIN';

  if (!session || !hasAccess) {
    redirect('/');
  }

  return (
    <SessionProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar variant="admin" />
        <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-[#0f0f0f] p-4 md:p-8 min-w-0 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
