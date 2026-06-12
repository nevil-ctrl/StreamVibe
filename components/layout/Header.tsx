'use client';

import Navbar from './Navbar';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/user')) return null;

  return (
    <header
      className={`
      sticky top-0 left-0 z-50 w-full
      transition-all duration-300
      ${scrolled ? 'bg-black/60 backdrop-blur-sm' : ''}
    `}>
      <div className="container pt-8">
        <Navbar />
      </div>
    </header>
  );
}
