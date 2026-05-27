'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { updateProfile, updatePassword, updateAvatar } from './actions';
import {
  User,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: string;
}

type MsgState = { type: 'success' | 'error'; text: string } | null;

function StatusMsg({ msg }: { msg: MsgState }) {
  if (!msg) return null;
  return (
    <div
      className={`flex items-center gap-2 text-sm p-3 rounded-xl ${msg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {msg.type === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {msg.text}
    </div>
  );
}

export default function SettingsClient({ user }: { user: UserData }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [currentImage, setCurrentImage] = useState(user.image);
  const [avatarMsg, setAvatarMsg] = useState<MsgState>(null);
  const [profileMsg, setProfileMsg] = useState<MsgState>(null);
  const [passwordMsg, setPasswordMsg] = useState<MsgState>(null);

  const { startUpload, isUploading } = useUploadThing('avatarUploader', {
    onClientUploadComplete: async (res) => {
      const url = res[0].url;

      setCurrentImage(url);
      await updateAvatar(url);

      await update({
        image: url,
        user: {
          image: url,
        },
      });

      setAvatarMsg({ type: 'success', text: 'Аватар обновлён' });
      setTimeout(() => setAvatarMsg(null), 3000);
    },
    onUploadError: () => {
      setAvatarMsg({ type: 'error', text: 'Ошибка загрузки аватара' });
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await startUpload([file]);
  };

  function handleProfile(formData: FormData) {
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setProfileMsg({ type: 'success', text: 'Профиль успешно обновлён' });
        setTimeout(() => setProfileMsg(null), 3000);
      } catch {
        setProfileMsg({ type: 'error', text: 'Ошибка при обновлении' });
      }
    });
  }

  function handlePassword(formData: FormData) {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: 'Пароль должен быть не менее 6 символов',
      });
      return;
    }
    startPasswordTransition(async () => {
      try {
        const result = await updatePassword(formData);
        if (result.success) {
          setPasswordMsg({ type: 'success', text: 'Пароль успешно изменён' });
          setTimeout(() => setPasswordMsg(null), 3000);
        } else {
          setPasswordMsg({ type: 'error', text: result.message ?? 'Ошибка' });
        }
      } catch {
        setPasswordMsg({ type: 'error', text: 'Ошибка при смене пароля' });
      }
    });
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Настройки профиля</h1>
          <p className="text-[#666] mt-1 text-sm">С нами с {joinDate}</p>
        </div>

        <div className="flex items-center gap-5 p-6 bg-[#111] rounded-2xl border border-[#222]">
          <div className="relative group">
            <label className="cursor-pointer">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#222] border-2 border-[#333] flex items-center justify-center relative">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#555]">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{user.name || 'Без имени'}</p>
            <p className="text-[#666] text-sm">{user.email}</p>
            {!user.hasPassword && (
              <span className="text-xs text-[#E50000] bg-[#E50000]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                Вход через Google
              </span>
            )}
            {avatarMsg && (
              <div className="mt-2">
                <StatusMsg msg={avatarMsg} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
            <User className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">Личные данные</h2>
          </div>
          <form action={handleProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#666] mb-2">Имя</label>
              <input
                name="name"
                defaultValue={user.name}
                placeholder="Ваше имя"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="email@example.com"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
              />
            </div>
            <StatusMsg msg={profileMsg} />
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#E50000] hover:bg-[#cc0000] text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50">
              {isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
            <Lock className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">Смена пароля</h2>
          </div>
          <form action={handlePassword} className="p-6 space-y-4">
            {user.hasPassword && (
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Текущий пароль
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-[#666] mb-2">
                Новый пароль
              </label>
              <input
                name="newPassword"
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                Подтвердить пароль
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
              />
            </div>
            <StatusMsg msg={passwordMsg} />
            <button
              type="submit"
              disabled={isPasswordPending}
              className="bg-[#E50000] hover:bg-[#cc0000] text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50">
              {isPasswordPending ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
