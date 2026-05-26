'use client';
import { useTransition } from 'react';
import { updateProfile } from './actions';

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProfile(formData);
      alert('Профиль обновлен!');
    });
  }

  return (
    <div className="p-8 text-white max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>

      <form
        action={handleSubmit}
        className="space-y-6 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
        <div>
          <label className="block text-sm text-neutral-400">Имя</label>
          <input
            name="name"
            defaultValue="Имя Пользователя"
            className="w-full bg-black border border-neutral-700 p-3 rounded-lg mt-1 focus:border-red-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-400">Email</label>
          <input
            name="email"
            type="email"
            defaultValue="user@example.com"
            className="w-full bg-black border border-neutral-700 p-3 rounded-lg mt-1 focus:border-red-600 outline-none"
          />
        </div>

        <button
          disabled={isPending}
          className="bg-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50">
          {isPending ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
