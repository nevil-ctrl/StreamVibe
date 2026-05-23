'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS } from '@/lib/constants';
import { Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="container flex w-full items-center justify-between ">
      <Link href="/">
        <Image src="/logo/Logo.svg" alt="StreamVibe" width={160} height={43} />
      </Link>

      <div className="flex items-center justify-center gap-[30px] bg-[#0F0F0F] border-4 border-[#1F1F1F] rounded-[10px] pl-[10px] pr-[29px] py-[10px]">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? 'nav-link-active' : ''}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-[30px]">
        <button>
          <Search size={23} className="text-white" />
        </button>
        <button>
          <Bell size={23} className="text-white" />
        </button>
      </div>
    </nav>
  );
}
