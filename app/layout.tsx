import './globals.css';
import { Manrope } from 'next/font/google';
// import Header from '@/components/layout/Header';
import HeaderController from '@/components/layout/HeaderController';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/Providers'; // Твой обновленный провайдер
import FooterController from '@/components/layout/FooterController';
import { Suspense } from 'react';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <body className={manrope.className} suppressHydrationWarning>
        <Providers>
          <HeaderController /> {/* ← вместо <Header /> */}
          <main>{children}</main>
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
