import Sidebar from '@/components/layout/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
