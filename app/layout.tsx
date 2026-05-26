import './globals.css';
import { Manrope } from 'next/font/google';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/Providers';

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
    <html lang="en">
      <body className={manrope.variable} suppressHydrationWarning={true}>
        <Providers>
          <Header />

          <main>{children}</main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
