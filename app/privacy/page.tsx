import Link from 'next/link';
import { getServerTranslations } from '@/lib/i18n/get-locale';

export const metadata = {
  title: 'Privacy Policy | StreamVibe',
  description: 'Read StreamVibe Privacy Policy and learn how we handle your data',
};

export default async function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-[#999999]">
            {t('privacy.lastUpdated', { date: currentDate })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-12 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Introduction */}
          <section className="mb-12 p-6 bg-[#1A1A1C] border border-[#262628] rounded-lg">
            <p className="text-[#999999] leading-7">{t('privacy.intro')}</p>
          </section>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('privacy.section1.title')}
            </h2>
            <p className="text-[#999999] leading-7 mb-6">{t('privacy.section1.content')}</p>

            {/* Subsections */}
            <div className="space-y-6">
              {(t('privacy.section1.subsections') as Array<{ title: string; content: string }>).map(
                (subsection, index) => (
                  <div key={index} className="pl-4 border-l-2 border-[#E50000]">
                    <h3 className="font-semibold text-white mb-2">{subsection.title}</h3>
                    <p className="text-[#999999] leading-7">{subsection.content}</p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('privacy.section2.title')}
            </h2>
            <p className="text-[#999999] leading-7 mb-4">{t('privacy.section2.content')}</p>
            <ul className="space-y-3">
              {(t('privacy.section2.items') as string[]).map((item, index) => (
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
              {t('privacy.section3.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('privacy.section3.content')}</p>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('privacy.section4.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('privacy.section4.content')}</p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {t('privacy.section5.title')}
            </h2>
            <p className="text-[#999999] leading-7">{t('privacy.section5.content')}</p>
          </section>

          {/* Contact Section */}
          <section className="mt-16 p-8 bg-[#1A1A1C] border border-[#262628] rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Questions About Your Privacy?</h3>
            <p className="text-[#999999] mb-4">
              If you have any questions about our Privacy Policy or how we handle your data, please
              contact us through our{' '}
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
