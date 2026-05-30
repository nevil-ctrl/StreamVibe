'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LifeBuoy,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';

interface Reply {
  id: string;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  firstName: string;
  lastName: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  replies: Reply[];
}

const STATUS_CONFIG = {
  OPEN: {
    label: 'Открыт',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  IN_PROGRESS: {
    label: 'В работе',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  RESOLVED: {
    label: 'Решён',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
  CLOSED: {
    label: 'Закрыт',
    color: 'text-neutral-400',
    bg: 'bg-neutral-400/10',
    border: 'border-neutral-400/20',
  },
};

export default function UserSupportPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const fetchTickets = () => {
    fetch('/api/support')
      .then((r) => r.json())
      .then((d) => {
        if (d.tickets) setTickets(d.tickets);
        else setError('Не удалось загрузить обращения');
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/user/support');
      return;
    }
    if (status !== 'authenticated') return;

    fetchTickets();
  }, [status, router]);

  const toggleExpand = (ticketId: string) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E50000]/10 border border-[#E50000]/20 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-[#E50000]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">История обращений</h1>
            <p className="text-sm text-neutral-500">
              Все ваши запросы в поддержку
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/support')}
          className="flex items-center gap-2 bg-[#E50000] hover:bg-[#FF1919] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Новое обращение
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#E50000] animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 bg-[#E50000]/10 border border-[#E50000]/20 rounded-xl px-4 py-3 text-sm text-[#E50000]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <LifeBuoy className="w-7 h-7 text-neutral-600" />
          </div>
          <div>
            <p className="font-semibold mb-1">Обращений пока нет</p>
            <p className="text-neutral-500 text-sm">
              Если возникнут вопросы — мы всегда на связи
            </p>
          </div>
          <button
            onClick={() => router.push('/support')}
            className="mt-2 bg-[#E50000] hover:bg-[#FF1919] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Написать в поддержку
          </button>
        </div>
      )}

      {/* Tickets list */}
      {!loading && !error && tickets.length > 0 && (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => {
            const s = STATUS_CONFIG[ticket.status];
            const isExpanded = expandedTicketId === ticket.id;

            const dateStr = new Date(ticket.createdAt).toLocaleDateString(
              'ru-RU',
              {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              },
            );
            const timeStr = new Date(ticket.createdAt).toLocaleTimeString(
              'ru-RU',
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            );

            return (
              <div
                key={ticket.id}
                className="bg-neutral-950 border border-neutral-900 rounded-xl transition-all overflow-hidden">
                {/* Шапка карточки */}
                <div
                  onClick={() => toggleExpand(ticket.id)}
                  className="p-5 hover:bg-neutral-900/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      {ticket.status === 'RESOLVED' ||
                      ticket.status === 'CLOSED' ? (
                        <CheckCircle className="w-4 h-4 text-neutral-500 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                      )}
                      <span className="text-xs text-neutral-500 font-mono">
                        #{ticket.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                        {s.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm text-neutral-200 leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                      <Clock className="w-3 h-3" />
                      {dateStr} в {timeStr}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-neutral-900 sm:border-0 pt-3 sm:pt-0">
                    {ticket.replies.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-md">
                        <MessageSquare className="w-3.5 h-3.5 text-[#E50000]" />
                        <span>{ticket.replies.length}</span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-500" />
                    )}
                  </div>
                </div>

                {/* Блок просмотра истории (Чисто чтение) */}
                {isExpanded && (
                  <div className="border-t border-neutral-900 bg-neutral-900/20 p-5 flex flex-col gap-4">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                      История обращения
                    </div>

                    {/* Вопрос пользователя */}
                    <div className="flex flex-col gap-1 bg-neutral-900/40 p-4 rounded-xl max-w-[85%] self-start border border-neutral-900">
                      <span className="text-[11px] font-medium text-neutral-400">
                        Ваш вопрос
                      </span>
                      <p className="text-sm text-neutral-200 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                      <span className="text-[9px] text-neutral-600 text-right mt-1">
                        {timeStr}
                      </span>
                    </div>

                    {/* Ответы от поддержки */}
                    {ticket.replies.map((reply) => {
                      const replyTime = new Date(
                        reply.createdAt,
                      ).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={reply.id}
                          className="flex flex-col gap-1 p-4 rounded-xl max-w-[85%] border self-end bg-[#E50000]/5 border-[#E50000]/10 text-right items-end">
                          <span className="text-[11px] font-bold text-[#E50000]">
                            Ответ поддержки StreamVibe
                          </span>
                          <p className="text-sm text-neutral-200 text-left whitespace-pre-wrap">
                            {reply.message}
                          </p>
                          <span className="text-[9px] text-neutral-600 mt-1">
                            {replyTime}
                          </span>
                        </div>
                      );
                    })}

                    {/* Заглушка, если ответа еще нет */}
                    {ticket.replies.length === 0 && (
                      <div className="text-xs text-neutral-500 italic text-center py-4 bg-neutral-900/10 rounded-xl border border-dashed border-neutral-900">
                        Ожидайте ответа. Менеджер уже изучает ваше обращение.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
