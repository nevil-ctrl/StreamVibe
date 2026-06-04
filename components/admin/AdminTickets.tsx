'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  FileSpreadsheet,
  FileText,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

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
  email: string;
  phone: string | null;
  message: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string | null;
  user: { id: string; name: string | null; email: string } | null;
  replies: Reply[];
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  CLOSED: 'Закрыт',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-red-500/20 text-red-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-white/10 text-white/40',
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status });
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const res = await fetch(`/api/admin/tickets?${params}`);
    const data = await res.json();
    setTickets(data.tickets);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [page, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  useEffect(() => {
    setPage(1);
  }, [status, dateFrom, dateTo]);

  async function handleReply(ticketId: string, newStatus: TicketStatus) {
    setSending(true);
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        message: replyText[ticketId] || undefined,
      }),
    });
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    setSending(false);
    fetchTickets();
  }

  // --- Экспорт Excel ---
  function exportExcel() {
    const rows = tickets.map((t) => ({
      ID: t.id,
      Имя: `${t.firstName} ${t.lastName}`,
      Email: t.email,
      Телефон: t.phone || '—',
      Сообщение: t.message,
      Статус: STATUS_LABELS[t.status],
      Создан: new Date(t.createdAt).toLocaleString('ru'),
      Ответов: t.replies.length,
      'Последний ответ': t.replies.length
        ? new Date(t.replies[t.replies.length - 1].createdAt).toLocaleString(
            'ru',
          )
        : '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Тикеты');
    // Ширина колонок
    ws['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 20 },
    ];
    XLSX.writeFile(wb, `tickets_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // --- Экспорт PDF ---
  function exportPDF() {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Заголовок
    doc.setFontSize(16);
    doc.text('StreamVibe — Отчёт по тикетам', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Сформирован: ${new Date().toLocaleString('ru')} | Всего: ${total}`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          'ID',
          'Пользователь',
          'Email',
          'Сообщение',
          'Статус',
          'Создан',
          'Ответов',
          'Последний ответ',
        ],
      ],
      body: tickets.map((t) => [
        t.id.slice(0, 8) + '...',
        `${t.firstName} ${t.lastName}`,
        t.email,
        t.message.length > 50 ? t.message.slice(0, 50) + '...' : t.message,
        STATUS_LABELS[t.status],
        new Date(t.createdAt).toLocaleDateString('ru'),
        String(t.replies.length),
        t.replies.length
          ? new Date(t.replies[t.replies.length - 1].createdAt).toLocaleString(
              'ru',
            )
          : '—',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [229, 0, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 22 },
        3: { cellWidth: 60 },
      },
    });

    doc.save(`tickets_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const filters: Array<{ key: string; label: string }> = [
    { key: 'all', label: 'Все' },
    { key: 'OPEN', label: 'Открыт' },
    { key: 'IN_PROGRESS', label: 'В работе' },
    { key: 'RESOLVED', label: 'Решён' },
    { key: 'CLOSED', label: 'Закрыт' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Тикеты поддержки</h1>
          <p className="text-white/50 text-sm mt-1">Всего: {total}</p>
        </div>
        {/* Экспорт */}
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium transition-all border border-emerald-500/20">
            <FileSpreadsheet size={16} />
            Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-all border border-blue-500/20">
            <FileText size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Filters + Date range */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Статус */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === f.key
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        {/* Дата от/до */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-white/30" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-white/20 [color-scheme:dark]"
          />
          <span className="text-white/30 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-white/20 [color-scheme:dark]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-white/30 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5 transition-all">
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-xl animate-pulse"
              />
            ))
        ) : tickets.length === 0 ? (
          <div className="text-center text-white/30 py-12 flex flex-col items-center gap-3">
            <MessageSquare size={32} className="text-white/10" />
            <p>Тикетов нет</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpanded(expanded === ticket.id ? null : ticket.id)
                }>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium text-sm">
                      {ticket.firstName} {ticket.lastName}
                    </p>
                    <span className="text-white/30 text-xs">
                      {ticket.email}
                    </span>
                    {ticket.replies.length > 0 && (
                      <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                        {ticket.replies.length} отв.
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm truncate mt-0.5">
                    {ticket.message}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                    {STATUS_LABELS[ticket.status]}
                  </span>
                  <div className="text-right">
                    <p className="text-white/30 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString('ru')}
                    </p>
                    {ticket.replies.length > 0 && (
                      <p className="text-white/20 text-[10px]">
                        отв:{' '}
                        {new Date(
                          ticket.replies[ticket.replies.length - 1].createdAt,
                        ).toLocaleDateString('ru')}
                      </p>
                    )}
                  </div>
                  <span className="text-white/30">
                    {expanded === ticket.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === ticket.id && (
                <div className="border-t border-white/10 p-5 space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/40 text-xs mb-2">Сообщение</p>
                    <p className="text-white text-sm">{ticket.message}</p>
                    {ticket.phone && (
                      <p className="text-white/40 text-xs mt-2">
                        Тел: {ticket.phone}
                      </p>
                    )}
                  </div>

                  {ticket.replies.length > 0 && (
                    <div className="space-y-3">
                      {ticket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`rounded-lg p-3 text-sm ${
                            reply.fromAdmin
                              ? 'bg-red-500/10 border border-red-500/20 ml-8'
                              : 'bg-white/5 mr-8'
                          }`}>
                          <p
                            className={
                              reply.fromAdmin ? 'text-red-300' : 'text-white'
                            }>
                            {reply.message}
                          </p>
                          <p className="text-white/30 text-xs mt-1">
                            {reply.fromAdmin ? '👑 Админ' : '👤 Пользователь'} ·{' '}
                            {new Date(reply.createdAt).toLocaleString('ru')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <textarea
                      value={replyText[ticket.id] ?? ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      placeholder="Написать ответ..."
                      rows={3}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {ticket.status !== 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleReply(ticket.id, 'IN_PROGRESS')}
                          disabled={sending}
                          className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-sm transition-all disabled:opacity-50">
                          Взять в работу
                        </button>
                      )}
                      {ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleReply(ticket.id, 'RESOLVED')}
                          disabled={sending}
                          className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm transition-all disabled:opacity-50">
                          Решить
                        </button>
                      )}
                      {ticket.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleReply(ticket.id, 'CLOSED')}
                          disabled={sending}
                          className="px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-sm transition-all disabled:opacity-50">
                          Закрыть
                        </button>
                      )}
                      {replyText[ticket.id] && (
                        <button
                          onClick={() => handleReply(ticket.id, ticket.status)}
                          disabled={sending}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm flex items-center gap-2 transition-all disabled:opacity-50 ml-auto">
                          <Send size={14} /> Отправить ответ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm transition-all ${
                page === p
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
