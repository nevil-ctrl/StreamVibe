'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWatch = pathname.startsWith('/watch');

  if (isWatch) return <>{children}</>;
  return <main>{children}</main>;
}
