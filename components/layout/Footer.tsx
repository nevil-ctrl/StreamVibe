import Link from 'next/link';
import Image from 'next/image';
import { getPopularMovies } from '@/services/movies.service';
import { TMDB_IMAGE_URL } from '@/lib/tmdb';
import { ManageCookiesButton } from '@/components/consent/CookieConsent';
import { getServerTranslations } from '@/lib/i18n/get-locale';

type Movie = {
  id: number;
  poster_path: string;
  title: string;
};

function FooterPosterRow({
  items,
  direction,
}: {
  items: Movie[];
  direction: 'left' | 'right';
}) {
  return (
    <div
      suppressHydrationWarning
      className={`flex w-max gap-4 ${
        direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'
      }`}>
      {[...items, ...items, ...items, ...items].map((movie, i) => (
        <div
          key={`${movie.id || i}-${i}`}
          className="relative shrink-0 overflow-hidden rounded-[10px] w-[140px] h-[90px]">
          <Image
            src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="140px"
            className="object-cover mix-blend-luminosity brightness-70"
          />
        </div>
      ))}
    </div>
  );
}

export default async function Footer() {
  const { t } = await getServerTranslations();
  let movies: Movie[] = [];
  try {
    const data = await getPopularMovies();
    movies = data.results || [];
  } catch (error) {
    console.error('Footer poster load error:', error);
  }

  const row1 = movies.slice(0, 10);
  const row2 = movies.slice(10, 20);
  const row3 = movies.slice(0, 10);
  const row4 = movies.slice(10, 20);

  return (
    <footer className="w-full bg-[#0F0F11] text-white border-t border-[#262628] select-none pt-20">
      <div className="container mx-auto px-4 md:px-12">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#262628] bg-black py-16 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl h-[320px] md:h-[240px]">
          <div
            suppressHydrationWarning
            className="absolute inset-0 flex flex-col gap-4 overflow-hidden opacity-15 pointer-events-none py-3">
            {row1.length > 0 && (
              <FooterPosterRow items={row1} direction="right" />
            )}
            {row2.length > 0 && (
              <FooterPosterRow items={row2} direction="left" />
            )}
            {row3.length > 0 && (
              <FooterPosterRow items={row3} direction="right" />
            )}
            {row4.length > 0 && (
              <FooterPosterRow items={row4} direction="left" />
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-l from-[#E50000]/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none md:hidden" />

          <div className="relative z-10 text-center md:text-left flex flex-col gap-3">
            <h2 className="text-[28px] md:text-[36px] font-bold text-white tracking-tight">
              {t('footer.trialTitle')}
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#999999] leading-relaxed">
              {t('footer.trialDescription')}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/subscriptions"
              className="px-6 py-4 bg-[#E50000] hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition duration-200 shadow-lg shadow-red-900/30 cursor-pointer whitespace-nowrap">
              {t('footer.trialCta')}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 pt-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 pb-16 border-b border-[#262628]">
          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('footer.home')}
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#999999]">
              <Link href="#" className="hover:text-white transition">
                {t('footer.categories')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.devices')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.pricing')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.faq')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('footer.movies')}
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#999999]">
              <Link href="#" className="hover:text-white transition">
                {t('footer.genres')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.trending')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.newRelease')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.popular')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('footer.shows')}
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#999999]">
              <Link href="#" className="hover:text-white transition">
                {t('footer.genres')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.trending')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.newRelease')}
              </Link>
              <Link href="#" className="hover:text-white transition">
                {t('footer.popular')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('nav.support')}
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#999999]">
              <Link href="/support" className="hover:text-white transition">
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('footer.subscription')}
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#999999]">
              <Link href="/subscriptions" className="hover:text-white transition">
                {t('footer.plans')}
              </Link>
              <Link href="/subscriptions" className="hover:text-white transition">
                {t('footer.features')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[17px] font-semibold text-white">
              {t('footer.connectWithUs')}
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#E50000] hover:border-[#E50000] transition duration-200">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.95z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#E50000] hover:border-[#E50000] transition duration-200">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262628] hover:bg-[#E50000] hover:border-[#E50000] transition duration-200">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 text-[14px] text-[#666666]">
          <span>{t('footer.copyright')}</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition">
              {t('footer.termsOfUse')}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="#" className="hover:text-white transition">
              {t('footer.cookiePolicy')}
            </Link>
            <ManageCookiesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
