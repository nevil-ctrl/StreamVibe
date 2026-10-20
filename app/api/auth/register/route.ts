import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/lib/normalize-email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email =
      typeof body.email === 'string' ? normalizeEmail(body.email) : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким Email уже зарегистрирован' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

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
