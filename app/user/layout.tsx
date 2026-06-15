import Sidebar from '@/components/layout/Sidebar';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // ← получаем сессию на сервере

  return (
    <SessionProvider session={session}>
      {' '}
      {/* ← передаём в провайдер */}
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-black min-w-0 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
