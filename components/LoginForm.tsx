'use client'; // Обязательно в самом верху

interface LoginFormProps {
  someData?: any; // Твои пропсы, если передаешь что-то с сервера
}

export default function LoginForm({ someData }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Твоя логика отправки / вызова signIn() из Auth.js
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" />
      <button type="submit">Войти</button>
    </form>
  );
}
