'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Ban,
  CheckCircle,
  Shield,
  ShieldOff,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  subscription: { plan: string; status: string; expiresAt: string } | null;
  _count: { watchHistory: number; payments: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [banModal, setBanModal] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        filter,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  async function handleBan() {
    if (!banModal) return;
    setActionLoading(true);
    await fetch(`/api/admin/users/${banModal.userId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: banReason,
        expiresAt: banExpiresAt || null,
      }),
    });
    setBanModal(null);
    setBanReason('');
    setActionLoading(false);
    fetchUsers();
  }

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    await fetch('/api/admin/system/change-role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newRole }),
    });
    fetchUsers();
  }

  async function handleUnban(userId: string) {
    await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'DELETE',
    });
    fetchUsers();
  }

  const planColor = (plan: string) =>
    ({
      BASIC: 'text-white/50',
      STANDARD: 'text-blue-400',
      PREMIUM: 'text-yellow-400',
    })[plan] ?? 'text-white/50';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-white/50 text-sm mt-1">Всего: {total}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'banned', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white'
              }`}>
              {{ all: 'Все', banned: 'Забаненные', admin: 'Админы' }[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-white/30">
            Пользователи не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 text-xs font-medium px-5 py-3">
                  Пользователь
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-5 py-3">
                  Роль
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-5 py-3">
                  Подписка
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-5 py-3">
                  Просмотры
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-5 py-3">
                  Статус
                </th>
                <th className="text-right text-white/40 text-xs font-medium px-5 py-3">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt=""
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          <User size={16} className="text-white/40" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.name ?? '—'}
                        </p>
                        <p className="text-white/40 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        user.role === 'SUPERADMIN'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : user.role === 'ADMIN'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/5 text-white/50'
                      }`}>
                      {user.role === 'SUPERADMIN'
                        ? '⚡ Главный админ'
                        : user.role === 'ADMIN'
                          ? '👑 Админ'
                          : 'Юзер'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.subscription ? (
                      <span
                        className={`text-xs font-medium ${planColor(
                          user.subscription.plan,
                        )}`}>
                        {user.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">Нет</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white/50 text-sm">
                      {user._count?.watchHistory ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.isBanned ? (
                      <div>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                          Забанен
                        </span>
                        {user.banReason && (
                          <p className="text-white/30 text-xs mt-1 max-w-32 truncate">
                            {user.banReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Активен
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'SUPERADMIN' && (
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/80 px-2.5 py-1.5 rounded-lg transition-all">
                          {user.role === 'ADMIN' ? (
                            <>
                              <ShieldOff size={13} /> Снять админа
                            </>
                          ) : (
                            <>
                              <Shield size={13} /> Дать админа
                            </>
                          )}
                        </button>
                      )}

                      {user.role !== 'SUPERADMIN' &&
                        (user.isBanned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition-all">
                            <CheckCircle size={13} /> Разбанить
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setBanModal({
                                userId: user.id,
                                name: user.name ?? user.email,
                              })
                            }
                            className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-all">
                            <Ban size={13} /> Бан
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">
            Страница {page} из {pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {banModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-semibold text-lg mb-1">
              Заблокировать пользователя
            </h3>
            <p className="text-white/50 text-sm mb-5">{banModal.name}</p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Причина блокировки..."
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none mb-4"
            />

            <label className="text-white/50 text-xs mb-2 block">
              Разблокировать до (опционально)
            </label>
            <input
              type="datetime-local"
              value={banExpiresAt}
              onChange={(e) => setBanExpiresAt(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBanModal(null);
                  setBanReason('');
                  setBanExpiresAt('');
                }}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">
                Отмена
              </button>
              <button
                onClick={handleBan}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all text-sm disabled:opacity-50">
                {actionLoading ? 'Блокирую...' : 'Заблокировать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
