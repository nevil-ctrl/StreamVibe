'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/components/providers/LocaleProvider';

interface AskQuestionButtonProps {
  onClick?: () => void;
  scrollToId?: string;
  href?: string;
}

export default function AskQuestionButton({
  onClick,
  scrollToId,
  href,
}: AskQuestionButtonProps) {
  const router = useRouter();
  const t = useTranslations();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (scrollToId) {
      document
        .getElementById(scrollToId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className=" cursor-pointer bg-[#E50000] hover:bg-[#FF1919] text-white px-5 py-3 rounded-md font-medium text-sm whitespace-nowrap self-start sm:self-auto transition-colors">
      {t('faq.askQuestion')}
    </button>
  );
}
