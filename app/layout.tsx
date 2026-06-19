import './globals.css';
import { Manrope } from 'next/font/google';
import HeaderController from '@/components/layout/HeaderController';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/Providers';
import FooterController from '@/components/layout/FooterController';
import { Suspense } from 'react';
import MainWrapper from '@/components/layout/MainWrapper';
import { getLocale } from '@/lib/i18n/get-locale';
import { getServerSession } from '@/lib/auth-session';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, session] = await Promise.all([getLocale(), getServerSession()]);

  return (
    <html lang={locale} suppressHydrationWarning className={manrope.variable}>
      <body className={manrope.className} suppressHydrationWarning>
        <Providers initialLocale={locale} session={session}>
          <HeaderController />
          <MainWrapper>{children}</MainWrapper>
          <FooterController>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </FooterController>
        </Providers>
      </body>
    </html>
  );
}
