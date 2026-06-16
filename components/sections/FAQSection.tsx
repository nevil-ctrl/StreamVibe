import FaqSection from '@/components/ui/FaqSection';
import AskQuestionButton from '@/components/ui/AskQuestionButton';
import { getServerTranslations } from '@/lib/i18n/get-locale';

export default async function FAQSection() {
  const { t } = await getServerTranslations();

  const faqs = [
    { id: '01', question: t('faq.q1'), answer: t('faq.a1') },
    { id: '02', question: t('faq.q2'), answer: t('faq.a2') },
    { id: '03', question: t('faq.q3'), answer: t('faq.a3') },
    { id: '04', question: t('faq.q4'), answer: t('faq.a4') },
    { id: '05', question: t('faq.q5'), answer: t('faq.a5') },
    { id: '06', question: t('faq.q6'), answer: t('faq.a6') },
    { id: '07', question: t('faq.q7'), answer: t('faq.a7') },
    { id: '08', question: t('faq.q8'), answer: t('faq.a8') },
  ];

  return (
    <section className="py-16">
      <FaqSection
        title={t('faq.title')}
        subtitle={t('faq.subtitle')}
        items={faqs}
        actionButton={<AskQuestionButton href="/support" />}
      />
    </section>
  );
}
