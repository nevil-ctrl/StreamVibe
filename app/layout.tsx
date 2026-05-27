import './globals.css';
import { Manrope } from 'next/font/google';
import { headers } from 'next/headers';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/Providers';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isUserPage = pathname.startsWith('/user');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.variable} suppressHydrationWarning={true}>
        <Providers>
          {!isUserPage && <Header />}
          <main>{children}</main>
          {!isUserPage && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
