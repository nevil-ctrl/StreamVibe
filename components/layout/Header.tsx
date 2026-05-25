'use client';

import Navbar from './Navbar';
import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`
      sticky top-0 left-0 z-50 w-full
      transition-all duration-300
      ${scrolled ? 'bg-black/60 backdrop-blur-sm' : ''}
    `}>
      <div className="mx-auto max-w-[1600px] px-18 pt-8">
        <Navbar />
      </div>
    </header>
  );
}
