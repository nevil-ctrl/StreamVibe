import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--black-06)] px-4 text-center">
      <h1 className="text-9xl font-black text-[var(--red-45)] tracking-widest drop-shadow-[0_0_20px_rgba(229,0,0,0.4)] selection:bg-none">
        404
      </h1>

      <div className="bg-[var(--red-45)] text-[var(--black)] text-xs font-bold uppercase px-3 py-1 rounded-[4px] rotate-12 absolute -mt-24 ml-44 select-none">
        Фильм не найден
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--white)] mt-6 mb-2">
        Кажется, эта страница вырезана при монтаже
      </h2>

      <p className="text-[var(--grey-60)] max-w-md text-sm md:text-base mb-8">
        Маршрут, на который вы пытаетесь перейти, отсутствует, либо сеанс был
        перемещен. Попробуйте вернуться на главную страницу.
      </p>

      <Link href="/">
        <Button className="bg-[var(--black-08)] border border-[var(--black-15)] hover:bg-[var(--black-10)] text-[var(--white)] px-8 h-12 rounded-[8px] transition-all flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-[var(--grey-70)]" />
          На главный экран
        </Button>
      </Link>
    </div>
  );
}
