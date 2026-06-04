'use client';

import { useEffect, useState } from 'react';
import { Send, Bell, Users, Crown } from 'lucide-react';

const TARGETS = [
  { value: 'all', label: 'Все пользователи', icon: Users },
  { value: 'premium', label: 'Premium', icon: Crown },
  { value: 'standard', label: 'Standard', icon: Bell },
  { value: 'basic', label: 'Basic', icon: Bell },
];

const TYPES = [
  { value: 'ADMIN_BROADCAST', label: 'Объявление' },
  { value: 'PROMOTION', label: 'Акция' },
  { value: 'UPDATE', label: 'Обновление' },
  { value: 'WARNING', label: 'Предупреждение' },
];

interface RecentNotif {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMsg] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState('ADMIN_BROADCAST');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number } | null>(null);
  const [recent, setRecent] = useState<RecentNotif[]>([]);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then((r) => r.json())
      .then((d) => setRecent(d.recent ?? []));
  }, [result]);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    const res = await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type, target }),
    });
    const data = await res.json();
    setResult(data);
    setSending(false);
    if (data.success) {
      setTitle('');
      setMsg('');
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Рассылки</h1>
        <p className="text-white/50 text-sm mt-1">
          Отправка уведомлений пользователям
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-5">
        <h2 className="text-white font-medium">Новая рассылка</h2>

        {/* Target */}
        <div>
          <p className="text-white/50 text-sm mb-2">Аудитория</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TARGETS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTarget(value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  target === value
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : 'bg-black/20 border border-white/10 text-white/60 hover:text-white'
                }`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <p className="text-white/50 text-sm mb-2">Тип</p>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  type === value
                    ? 'bg-red-500 text-white'
                    : 'bg-black/20 border border-white/10 text-white/60 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-white/50 text-sm mb-2">Заголовок</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Новые фильмы этой недели!"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Message */}
        <div>
          <p className="text-white/50 text-sm mb-2">Сообщение</p>
          <textarea
            value={message}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Текст уведомления..."
            rows={4}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-green-400 text-sm">
            ✓ Отправлено {result.sent} пользователям
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={16} />
          {sending ? 'Отправляю...' : 'Отправить рассылку'}
        </button>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Последние рассылки</h2>
          <div className="space-y-3">
            {recent.map((n) => (
              <div key={n.id} className="flex gap-4 p-3 bg-white/5 rounded-lg">
                <Bell
                  size={16}
                  className="text-white/30 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{n.title}</p>
                  <p className="text-white/50 text-sm truncate">{n.message}</p>
                </div>
                <span className="text-white/30 text-xs flex-shrink-0">
                  {new Date(n.createdAt).toLocaleDateString('ru')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
