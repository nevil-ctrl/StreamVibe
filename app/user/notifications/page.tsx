'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  Trash2,
  CreditCard,
  AlertCircle,
  XCircle,
  Info,
  RefreshCw,
  Pin,
  PinOff,
  CheckSquare,
  Square,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isPinned?: boolean;
  createdAt: string;
}

function NotifIcon({ type }: { type: string }) {
  const base =
    'w-10 h-10 rounded-full flex items-center justify-center shrink-0';
  if (type === 'PAYMENT_SUCCESS')
    return (
      <div className={`${base} bg-green-400/10 text-green-400`}>
        <CreditCard size={18} />
      </div>
    );
  if (type === 'PAYMENT_FAILED')
    return (
      <div className={`${base} bg-red-400/10 text-red-400`}>
        <AlertCircle size={18} />
      </div>
    );
  if (type === 'SUBSCRIPTION_CANCELLED' || type === 'SUBSCRIPTION_EXPIRED')
    return (
      <div className={`${base} bg-neutral-500/10 text-neutral-400`}>
        <XCircle size={18} />
      </div>
    );
  if (type === 'ADMIN_MESSAGE')
    return (
      <div className={`${base} bg-blue-400/10 text-blue-400`}>
        <Info size={18} />
      </div>
    );
  return (
    <div className={`${base} bg-[#E50000]/10 text-[#E50000]`}>
      <Bell size={18} />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  // Закреплённые храним локально (можно потом вынести в БД)
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  }

  async function handleDeleteSelected() {
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch('/api/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }),
      ),
    );
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
    setSelected(new Set());
    setSelectMode(false);
  }

  async function handleClearAll() {
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications([]);
    setSelected(new Set());
    setSelectMode(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function togglePin(id: string) {
    setPinned((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function toggleSelectAll() {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  }

  // Закреплённые сверху
  const sorted = [...notifications].sort((a, b) => {
    const ap = pinned.has(a.id) ? 1 : 0;
    const bp = pinned.has(b.id) ? 1 : 0;
    return bp - ap;
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8 max-w-2xl">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Уведомления</h1>
          {unread > 0 && (
            <p className="text-neutral-500 text-sm mt-0.5">
              {unread} непрочитанных
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-neutral-900"
            title="Обновить">
            <RefreshCw size={16} />
          </button>
          {notifications.length > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectMode((v) => !v);
                  setSelected(new Set());
                }}
                className={`text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  selectMode
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                }`}>
                {selectMode ? 'Отмена' : 'Выбрать'}
              </button>
              {!selectMode && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-400 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-neutral-900">
                  <Trash2 size={14} />
                  Очистить всё
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Панель выбора */}
      {selectMode && notifications.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-4 py-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">
            {selected.size === notifications.length ? (
              <CheckSquare size={16} className="text-[#E50000]" />
            ) : (
              <Square size={16} />
            )}
            {selected.size === notifications.length
              ? 'Снять всё'
              : 'Выбрать всё'}
          </button>
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer">
              <Trash2 size={14} />
              Удалить выбранные ({selected.size})
            </button>
          )}
        </div>
      )}

      {/* Контент */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#E50000] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
            <Bell size={28} className="text-neutral-700" />
          </div>
          <p className="text-white font-medium mb-1">Уведомлений нет</p>
          <p className="text-neutral-600 text-sm">
            Здесь будут появляться уведомления об оплатах и сообщения от
            поддержки
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => {
            const isPinned = pinned.has(n.id);
            const isSelected = selected.has(n.id);
            return (
              <div
                key={n.id}
                onClick={() => selectMode && toggleSelect(n.id)}
                className={`flex gap-4 p-4 rounded-xl border transition-colors group relative ${
                  selectMode ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-neutral-800 border-neutral-700'
                    : isPinned
                      ? 'bg-neutral-900/80 border-[#E50000]/20'
                      : !n.isRead
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-transparent border-neutral-900 hover:bg-neutral-950'
                }`}>
                {/* Чекбокс в режиме выбора */}
                {selectMode && (
                  <div className="flex items-center shrink-0">
                    {isSelected ? (
                      <CheckSquare size={18} className="text-[#E50000]" />
                    ) : (
                      <Square size={18} className="text-neutral-600" />
                    )}
                  </div>
                )}

                {!selectMode && <NotifIcon type={n.type} />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isPinned && (
                        <Pin size={12} className="text-[#E50000] shrink-0" />
                      )}
                      <p
                        className={`font-medium text-sm truncate ${!n.isRead ? 'text-white' : 'text-neutral-300'}`}>
                        {n.title}
                      </p>
                    </div>
                    {/* Кнопки действий (видны при наведении, кроме режима выбора) */}
                    {!selectMode && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePin(n.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isPinned
                              ? 'text-[#E50000] hover:text-red-300'
                              : 'text-neutral-600 hover:text-neutral-300'
                          }`}
                          title={isPinned ? 'Открепить' : 'Закрепить'}>
                          {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1 rounded text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Удалить">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-neutral-500 text-sm mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-neutral-700 text-xs mt-2">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {!n.isRead && !selectMode && (
                  <div className="w-2 h-2 rounded-full bg-[#E50000] shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
