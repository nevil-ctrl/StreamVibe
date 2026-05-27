interface DescriptionBlockProps {
  overview: string;
}

export default function DescriptionBlock({ overview }: DescriptionBlockProps) {
  return (
    <section className="rounded-2xl border border-[#262628] bg-[#1A1A1A] p-6 md:p-8">
      <h2 className="mb-4 text-xl font-bold text-white">Description</h2>
      <p className="text-[15px] leading-relaxed text-[#999999]">
        {overview || 'Описание недоступно.'}
      </p>
    </section>
  );
}
