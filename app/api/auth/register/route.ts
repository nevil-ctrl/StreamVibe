import { NextResponse } from 'next/server';
// Выходим на 4 уровня вверх до папки lib/prisma
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Обработчик POST запроса, который будет принимать данные формы регистрации
export async function POST(req: Request) {
  try {
    // Получаем email, password и name, которые юзер ввёл на фронтенде
    const { email, password, name } = await req.json();

    // Проверяем, заполнил ли пользователь обязательные поля
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 },
      );
    }

    // Ищем в базе, нет ли уже пользователя с таким же email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Если нашли — прерываем регистрацию и выдаем ошибку
    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким Email уже зарегистрирован' },
        { status: 400 },
      );
    }

    // Хэшируем (шифруем) пароль. Число 10 — это оптимальная скорость шифрования saltRounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем новую запись в таблице User нашей базы данных
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0], // Если имя не ввели, берем часть email до собачки
        password: hashedPassword,
      },
    });

    // Возвращаем успешный ответ клиенту
    return NextResponse.json(
      { message: 'Пользователь успешно создан', userId: newUser.id },
      { status: 201 },
    );
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера при создании пользователя' },
      { status: 500 },
    );
  }
}
