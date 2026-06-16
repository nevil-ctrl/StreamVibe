import Link from 'next/link';
import { getServerTranslations } from '@/lib/i18n/get-locale';

export const metadata = {
  title: 'Terms of Use | StreamVibe',
  description: 'Read StreamVibe Terms of Use and Service Agreement',
};

export default async function TermsPage() {
  const { t } = await getServerTranslations();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0F0F11] text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E50000]/20 to-transparent border-b border-[#262628] pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#999999] hover:text-white transition mb-6">
            <span>←</span>
            <span>{t('common.back')}</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('terms.title')}</h1>
          <p className="text-[#999999]">
            {t('terms.lastUpdated', { date: currentDate })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-12 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section1.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section1.content')}</p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section2.title')}
            </h2>
            <p className="text-[#999999] leading-7 mb-4">{t('terms.section2.content')}</p>
            <ul className="space-y-3">
              {(t('terms.section2.items') as string[]).map((item, index) => (
                <li key={index} className="flex gap-3 text-[#999999]">
                  <span className="text-[#E50000] font-bold mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section3.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section3.content')}</p>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section4.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section4.content')}</p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section5.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section5.content')}</p>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section6.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section6.content')}</p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section7.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section7.content')}</p>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('terms.section8.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('terms.section8.content')}</p>
          </section>

          {/* Contact Section */}
          <section className="mt-16 p-8 bg-[#1A1A1C] border border-[#262628] rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Questions?</h3>
            <p className="text-[#999999] mb-4">
              If you have any questions about our Terms of Use, please contact us through our{' '}
              <Link href="/support" className="text-[#E50000] hover:underline">
                Support page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
