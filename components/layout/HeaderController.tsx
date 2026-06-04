'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderController() {
  const pathname = usePathname();

  const hideHeader =
    pathname.startsWith('/admin') || pathname.startsWith('/user');

  if (hideHeader) return null;

  return <Header />;
}
