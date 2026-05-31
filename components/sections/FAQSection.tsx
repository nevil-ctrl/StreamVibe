// components/sections/FAQSection.tsx
import FaqSection from '@/components/ui/FaqSection';

const faqs = [
  {
    id: '01',
    question: 'What is StreamVibe?',
    answer:
      'StreamVibe is a streaming service that allows you to watch movies and shows on demand.',
  },
  {
    id: '02',
    question: 'How much does StreamVibe cost?',
    answer:
      'We offer various plans tailored to your budget. Check our Subscriptions page for details.',
  },
  {
    id: '03',
    question: 'What content is available on StreamVibe?',
    answer:
      'Thousands of movies, series, documentaries, and exclusive originals available anytime.',
  },
  {
    id: '04',
    question: 'How can I watch StreamVibe?',
    answer:
      'You can watch via any smartphone, tablet, smart TV, laptop, or streaming device.',
  },
  {
    id: '05',
    question: 'How do I sign up for StreamVibe?',
    answer:
      'Click the Sign Up button, choose your plan, enter your details, and start streaming instantly.',
  },
  {
    id: '06',
    question: 'What is the StreamVibe free trial?',
    answer:
      'New users get a 7-day free trial to explore all features and content without limits.',
  },
  {
    id: '07',
    question: 'How do I contact StreamVibe customer support?',
    answer:
      'Fill out the contact form on our support page or use the live chat.',
  },
  {
    id: '08',
    question: 'What are the StreamVibe payment methods?',
    answer: 'We accept major credit cards, PayPal, Apple Pay, and Google Pay.',
  },
];

export default function FAQSection() {
  return (
    <section className="py-16">
      <FaqSection items={faqs} />
    </section>
  );
}
