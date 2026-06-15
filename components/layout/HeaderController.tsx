'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderController() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/watch') ||
    pathname.startsWith('/auth')
  )
    return null;

  return <Header />;
}
