'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/constants';
import { Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

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
        <button>
          <Search size={28} className="text-white transition hover:scale-110" />
        </button>

        <button>
          <Bell size={28} className="text-white transition hover:scale-110" />
        </button>
      </div>
    </nav>
  );
}
