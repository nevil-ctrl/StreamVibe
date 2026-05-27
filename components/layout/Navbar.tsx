'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/constants';
import { Search, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between">
      <Link href="/">
        <Image src="/logo/Logo.svg" alt="StreamVibe" width={200} height={60} />
      </Link>

      <div className="flex items-center rounded-[14px] border border-[#262626] bg-[#0F0F0F]/90 p-[10px] backdrop-blur-xl">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-[9px] px-6 py-4 text-[16px] font-medium transition ${
              pathname === href
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#BFBFBF] hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/search"
          className="cursor-pointer"
          aria-label="Поиск фильмов">
          <Search size={28} className="text-white transition hover:scale-110" />
        </Link>

        <button className="cursor-pointer">
          <Bell size={28} className="text-white transition hover:scale-110" />
        </button>

        {status === 'loading' ? (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent border-(--red-45)" />
        ) : session ? (
          <Link
            href="/user/profile"
            className="relative h-11 w-11 flex items-center justify-center rounded-full border border-[#262626] bg-[#1A1A1A] hover:border-(--red-45) transition overflow-hidden">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <User size={22} className="text-white" />
            )}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-[8px] bg-(--red-45) hover:bg-(--red-50) text-white text-sm font-medium px-5 py-2.5 transition duration-200">
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
}
