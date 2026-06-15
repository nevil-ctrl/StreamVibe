'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function FooterVisibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hideFooter =
      pathname?.startsWith('/user') ||
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/auth');
    if (wrapperRef.current) {
      if (hideFooter) {
        wrapperRef.current.classList.add('hide-footer');
      } else {
        wrapperRef.current.classList.remove('hide-footer');
      }
    }
  }, [pathname]);

  return <div ref={wrapperRef}>{children}</div>;
}
