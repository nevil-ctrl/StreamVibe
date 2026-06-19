'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { updateProfile, updatePassword, updateAvatar, requestPhoneUpdate, confirmPhoneUpdate } from './actions';
import {
  User,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale, useTranslations } from '@/components/providers/LocaleProvider';
import { formatDate } from '@/lib/i18n/formatters';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  const { locale } = useLocale();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [currentImage, setCurrentImage] = useState(user.image);
  const [avatarMsg, setAvatarMsg] = useState<MsgState>(null);
  const [profileMsg, setProfileMsg] = useState<MsgState>(null);
  const [passwordMsg, setPasswordMsg] = useState<MsgState>(null);
  const [phoneMsg, setPhoneMsg] = useState<MsgState>(null);
  const [isPhonePending, startPhoneTransition] = useTransition();
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [verificationCode, setVerificationCode] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startPhoneTransition(async () => {
      if (phoneStep === 'input') {
        const res = await requestPhoneUpdate(phoneInput);
        if (res.success) {
          setPhoneStep('verify');
          setPhoneMsg({ type: 'success', text: 'Код отправлен на вашу почту' });
        } else {
          setPhoneMsg({ type: 'error', text: res.message || 'Ошибка' });
        }
      } else {
        const res = await confirmPhoneUpdate(verificationCode);
        if (res.success) {
          setPhoneStep('input');
          setVerificationCode('');
          setPhoneMsg({ type: 'success', text: 'Телефон успешно обновлен' });
        } else {
          setPhoneMsg({ type: 'error', text: res.message || 'Ошибка кода' });
        }
      }
    });
  };

  const { startUpload, isUploading } = useUploadThing('avatarUploader', {
    onClientUploadComplete: async (res) => {
      const url = res[0].url;
      setCurrentImage(url);
      await updateAvatar(url);
      await update({ image: url, user: { image: url } });
      setAvatarMsg({ type: 'success', text: t('settings.avatarUpdated') });
      setTimeout(() => setAvatarMsg(null), 3000);
    },
    onUploadError: () => {
      setAvatarMsg({ type: 'error', text: t('settings.avatarUploadError') });
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
        setProfileMsg({ type: 'success', text: t('settings.profileUpdated') });
        setTimeout(() => setProfileMsg(null), 3000);
      } catch {
        setProfileMsg({ type: 'error', text: t('settings.profileUpdateError') });
      }
    });
  }

  function handlePassword(formData: FormData) {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: t('settings.passwordsMismatch') });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: t('settings.passwordMinLength'),
      });
      return;
    }
    startPasswordTransition(async () => {
      try {
        const result = await updatePassword(formData);
        if (result.success) {
          setPasswordMsg({ type: 'success', text: t('settings.passwordChanged') });
          setTimeout(() => setPasswordMsg(null), 3000);
        } else {
          setPasswordMsg({
            type: 'error',
            text: result.message ?? t('settings.error'),
          });
        }
      } catch {
        setPasswordMsg({ type: 'error', text: t('settings.passwordChangeError') });
      }
    });
  }

  const joinDate = formatDate(user.createdAt, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
          <p className="text-[#666] mt-1 text-sm">
            {t('settings.memberSince', { date: joinDate })}
          </p>
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
            <p className="font-semibold text-lg">
              {user.name || t('settings.noName')}
            </p>
            <p className="text-[#666] text-sm">{user.email}</p>
            {!user.hasPassword && (
              <span className="text-xs text-[#E50000] bg-[#E50000]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                {t('settings.googleSignIn')}
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
            <Globe className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">{t('language.label')}</h2>
          </div>
          <div className="p-6">
            <LanguageSwitcher variant="full" />
          </div>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
            <User className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">{t('settings.personalData')}</h2>
          </div>
          <form action={handleProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                {t('settings.name')}
              </label>
              <input
                name="name"
                defaultValue={user.name}
                placeholder={t('settings.namePlaceholder')}
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                {t('settings.email')}
              </label>
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
              {isPending ? t('settings.saving') : t('settings.save')}
            </button>
          </form>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
            <User className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">Изменить номер телефона</h2>
          </div>
          <form onSubmit={handlePhoneSubmit} className="p-6 space-y-4">
            {phoneStep === 'input' ? (
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Новый номер телефона
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Код из email
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#0A0A0A] border border-[#2a2a2a] text-white p-3 rounded-xl focus:border-[#E50000] outline-none transition placeholder:text-[#444]"
                />
              </div>
            )}
            <StatusMsg msg={phoneMsg} />
            <button
              type="submit"
              disabled={isPhonePending}
              className="bg-[#E50000] hover:bg-[#cc0000] text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50">
              {isPhonePending
                ? t('settings.saving')
                : phoneStep === 'input'
                  ? 'Отправить код на почту'
                  : 'Подтвердить код'}
            </button>
            {phoneStep === 'verify' && (
              <button
                type="button"
                onClick={() => {
                  setPhoneStep('input');
                  setPhoneMsg(null);
                  setVerificationCode('');
                }}
                className="ml-4 text-sm text-[#666] hover:text-white transition">
                Отмена
              </button>
            )}
          </form>
        </div>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
            <Lock className="w-5 h-5 text-[#E50000]" />
            <h2 className="font-semibold">{t('settings.changePassword')}</h2>
          </div>
          <form action={handlePassword} className="p-6 space-y-4">
            {user.hasPassword && (
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  {t('settings.currentPassword')}
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
                {t('settings.newPassword')}
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
                {t('settings.confirmPassword')}
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
              {isPasswordPending
                ? t('settings.saving')
                : t('settings.changePasswordBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
