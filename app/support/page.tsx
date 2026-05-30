'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchTMDB } from '@/services/tmdb';
import type { Movie, MovieResponse } from '@/types/movie';

const tmdbPoster = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  agreed: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
  agreed?: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'Required';
  if (!values.lastName.trim()) errors.lastName = 'Required';
  if (!values.email.trim()) {
    errors.email = 'Required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email';
  }
  if (!values.message.trim()) {
    errors.message = 'Required';
  } else if (values.message.trim().length < 10) {
    errors.message = 'At least 10 characters';
  }
  if (!values.agreed) errors.agreed = 'You must agree to continue';
  return errors;
}

const faqItems: FAQItem[] = [
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
      'Fill out the form above, or hit the "Ask a Question" button to launch live chat.',
  },
  {
    id: '08',
    question: 'What are the StreamVibe payment methods?',
    answer: 'We accept major credit cards, PayPal, Apple Pay, and Google Pay.',
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="text-xs text-[#E50000] mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </span>
  );
}

function InputField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>('01');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ── Начальные значения формы из сессии ───────────────────────────────────
  const getInitialForm = (): FormState => {
    if (session?.user) {
      const nameParts = (session.user.name ?? '').split(' ');
      return {
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') ?? '',
        email: session.user.email ?? '',
        phone: '',
        message: '',
        agreed: false,
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      agreed: false,
    };
  };

  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [serverError, setServerError] = useState<string>('');

  // ── Заполнить форму когда сессия загрузится (если ещё пустая) ────────────
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => {
        // Не перезаписываем если юзер уже что-то ввёл
        if (prev.firstName || prev.lastName || prev.email) return prev;
        const nameParts = (session.user.name ?? '').split(' ');
        return {
          ...prev,
          firstName: nameParts[0] ?? '',
          lastName: nameParts.slice(1).join(' ') ?? '',
          email: session.user.email ?? '',
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Загрузка постеров TMDB ────────────────────────────────────────────────
  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await fetchTMDB<MovieResponse>('/movie/popular?page=1');
        if (data?.results) setMovies(data.results.slice(0, 16));
      } catch (error) {
        console.error('TMDB error:', error);
      }
    }
    loadMovies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const newForm = {
      ...form,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    };
    setForm(newForm);
    if (touched[name]) setErrors(validateForm(newForm));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newTouched = { ...touched, [e.target.name]: true };
    setTouched(newTouched);
    setErrors(validateForm(form));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/support');
      return;
    }

    const allTouched = Object.keys(form).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );
    setTouched(allTouched);

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitStatus('loading');
    setServerError('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setTicketId(data.ticketId);
      setSubmitStatus('success');
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        agreed: false,
      });
      setTouched({});
      setErrors({});
    } catch (err) {
      setSubmitStatus('error');
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong',
      );
    }
  };

  const toggleFaq = (id: string) => setOpenFaq(openFaq === id ? null : id);

  const halfFaq = Math.ceil(faqItems.length / 2);
  const leftFaqColumn = faqItems.slice(0, halfFaq);
  const rightFaqColumn = faqItems.slice(halfFaq);

  const col1 = movies.slice(0, 4);
  const col2 = movies.slice(4, 8);
  const col3 = movies.slice(8, 12);
  const col4 = movies.slice(12, 16);

  const inputCn = (fieldName: keyof FormErrors) =>
    `w-full bg-[#141414] border rounded-md px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none transition-colors ${
      touched[fieldName] && errors[fieldName]
        ? 'border-[#E50000]'
        : 'border-[#262628] focus:border-[#E50000]'
    }`;

  const isLoggedIn = status === 'authenticated';
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans selection:bg-[#E50000]">
      <style jsx global>{`
        @keyframes marqueeUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes marqueeDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-marquee-up {
          animation: marqueeUp 25s linear infinite;
        }
        .animate-marquee-down {
          animation: marqueeDown 25s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-360">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20 md:mb-28">
          {/* ── Left: headline + poster grid ── */}
          <div className="lg:col-span-5 flex flex-col gap-8 h-full justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Welcome to our support page!
              </h1>
              <p className="text-[#999999] text-sm md:text-base leading-relaxed">
                Were here to help you with any problems you may be having with
                our product.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[#262628] bg-[#0A0A0A] p-3 h-120 overflow-hidden opacity-70 hover:opacity-90 transition-opacity duration-300 pointer-events-none hidden sm:block">
              <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#0A0A0A] to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#0A0A0A] to-transparent z-10" />
              <div className="grid grid-cols-4 gap-2 h-full">
                {movies.length > 0
                  ? [
                      { data: col1, dir: 'down' },
                      { data: col2, dir: 'up' },
                      { data: col3, dir: 'down' },
                      { data: col4, dir: 'up' },
                    ].map(({ data, dir }, colIdx) => (
                      <div
                        key={colIdx}
                        className={`flex flex-col gap-2 animate-marquee-${dir}`}>
                        {[...data, ...data].map((movie, idx) => (
                          <div
                            key={`col${colIdx}-${movie.id}-${idx}`}
                            className="relative rounded-md overflow-hidden bg-[#1A1A1A] aspect-2/3 w-full shrink-0">
                            <Image
                              src={tmdbPoster(movie.poster_path)}
                              alt={movie.title}
                              fill
                              sizes="10vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ))
                  : Array.from({ length: 4 }).map((_, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1A1A1A] rounded-md animate-pulse aspect-2/3 w-full"
                          />
                        ))}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div
            ref={formRef}
            className="lg:col-span-7 bg-[#0F0F0F] border border-[#262628] p-6 md:p-10 rounded-xl shadow-2xl">
            {/* Баннер для незалогиненных */}
            {!isLoggedIn && status !== 'loading' && (
              <div className="mb-6 flex items-start gap-3 bg-[#1A1A1A] border border-[#262628] rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-[#E50000] mt-0.5 shrink-0" />
                <p className="text-sm text-[#999]">
                  <button
                    onClick={() =>
                      router.push('/auth/login?callbackUrl=/support')
                    }
                    className="text-white underline hover:text-[#E50000] transition-colors">
                    Sign in
                  </button>{' '}
                  to autofill your details and track your support history.
                </p>
              </div>
            )}

            {/* Успешная отправка */}
            {submitStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <CheckCircle className="w-14 h-14 text-[#E50000]" />
                <h3 className="text-xl font-bold">Message sent!</h3>
                <p className="text-[#999] text-sm max-w-xs">
                  Thanks for reaching out. Well get back to you within 24 hours.
                </p>
                {ticketId && (
                  <p className="text-xs text-[#666] font-mono">
                    Ticket #{ticketId.slice(0, 8).toUpperCase()}
                  </p>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => router.push('/user/profile')}
                    className="mt-2 text-sm text-[#E50000] hover:text-[#FF1919] underline transition-colors">
                    View in your profile →
                  </button>
                )}
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="text-sm text-[#666] hover:text-white underline transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="First Name"
                    error={touched.firstName ? errors.firstName : undefined}>
                    <input
                      name="firstName"
                      type="text"
                      placeholder="Enter First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCn('firstName')}
                    />
                  </InputField>
                  <InputField
                    label="Last Name"
                    error={touched.lastName ? errors.lastName : undefined}>
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Enter Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCn('lastName')}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Email"
                    error={touched.email ? errors.email : undefined}>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCn('email')}
                    />
                  </InputField>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-white">
                      Phone Number
                    </label>
                    <div className="flex bg-[#141414] border border-[#262628] rounded-md overflow-hidden focus-within:border-[#E50000] transition-colors">
                      <div className="flex items-center gap-1 bg-[#1A1A1A] px-3 border-r border-[#262628] text-sm text-gray-400 select-none">
                        <span>🌐</span>
                        <span className="text-xs">▼</span>
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Enter Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-transparent px-4 py-3.5 text-white placeholder-[#4C4C4C] text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <InputField
                  label="Message"
                  error={touched.message ? errors.message : undefined}>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Enter your Message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputCn('message')} resize-none`}
                  />
                </InputField>

                {submitStatus === 'error' && serverError && (
                  <div className="flex items-center gap-2 text-sm text-[#E50000] bg-[#E50000]/10 border border-[#E50000]/20 rounded-md px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {serverError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-3 cursor-pointer select-none group text-xs md:text-sm text-[#999999]">
                      <input
                        name="agreed"
                        type="checkbox"
                        checked={form.agreed}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-4 h-4 rounded accent-[#E50000] bg-[#141414] border-[#262628] cursor-pointer"
                      />
                      <span>
                        I agree with{' '}
                        <span className="underline group-hover:text-white transition-colors">
                          Terms of Use
                        </span>{' '}
                        and{' '}
                        <span className="underline group-hover:text-white transition-colors">
                          Privacy Policy
                        </span>
                      </span>
                    </label>
                    <FieldError
                      message={touched.agreed ? errors.agreed : undefined}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="w-full sm:w-auto bg-[#E50000] hover:bg-[#FF1919] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 min-w-35">
                    {submitStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : !isLoggedIn ? (
                      'Sign in to Send'
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-[#999999] text-sm md:text-base max-w-3xl">
                Got questions? Weve got answers! Check out our FAQ section to
                find answers to the most common questions about StreamVibe.
              </p>
            </div>
            <button
              onClick={() =>
                formRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }
              className="bg-[#E50000] hover:bg-[#FF1919] text-white px-5 py-3 rounded-md font-medium text-sm whitespace-nowrap self-start sm:self-auto transition-colors">
              Ask a Question
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start pt-4">
            {[leftFaqColumn, rightFaqColumn].map((column, colIdx) => (
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
                          onClick={() => toggleFaq(item.id)}
                          className="w-full flex items-center justify-between text-left group">
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
      </div>
    </div>
  );
}
