import Sidebar from '@/components/layout/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-(--black-06)">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
