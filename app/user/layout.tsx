import Sidebar from '@/components/layout/Sidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-black min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
