'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  actionButton?: React.ReactNode;
}

export default function FaqSection({ items, actionButton }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string) => setOpenFaq(openFaq === id ? null : id);

  const left = items.slice(0, Math.ceil(items.length / 2));
  const right = items.slice(Math.ceil(items.length / 2));

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#999999] text-sm md:text-base max-w-3xl">
            Got questions? Weve got answers! Check out our FAQ section to find
            answers to the most common questions about StreamVibe.
          </p>
        </div>

        {/* ← слот для кнопки, рендерится только если передали */}
        {actionButton}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start pt-4">
        {[left, right].map((column, colIdx) => (
          <div
            key={colIdx}
            className={`flex flex-col gap-y-5 w-full ${colIdx === 1 ? 'lg:mt-0 mt-5' : ''}`}>
            {column.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className="border-b border-[#262628] pb-5 flex gap-4 md:gap-5 items-start">
                  <div className="bg-[#1A1A1A] border border-[#262628] rounded-md px-3 py-2 text-sm md:text-base font-bold text-white min-w-10 text-center">
                    {item.id}
                  </div>
                  <div className="flex-1 space-y-3">
                    <button
                      onClick={() => toggle(item.id)}
                      className="cursor-pointer w-full flex items-center justify-between text-left group">
                      <span className="font-semibold text-base md:text-lg text-white group-hover:text-[#E50000] transition-colors">
                        {item.question}
                      </span>
                      <span className="text-white ml-4 shrink-0">
                        {isOpen ? (
                          <Minus className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-200 ease-in-out text-sm md:text-base text-[#999999] leading-relaxed ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                      <div className="overflow-hidden">
                        <p className="pt-1">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
