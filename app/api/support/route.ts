import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
// 👇 Добавляем недостающие импорты (поправь пути, если файлы лежат в других папках)
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

const supportSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// GET — история тикетов текущего юзера вместе с ответами
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' }, // Ответы внутри тикета показываем от старых к новым
      },
    },
  });

  return NextResponse.json({ tickets });
}

// POST — создание нового тикета
export async function POST(req: NextRequest) {
  try {
    // Защищаем и POST-эндпоинт, так как нам нужен userId для привязки тикета
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = supportSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const message = Object.values(firstError).flat()[0] ?? 'Validation error';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { firstName, lastName, email, phone, message } = parsed.data;

    // 1. Сохраняем тикет в базу данных Prisma
    const newTicket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        firstName,
        lastName,
        email,
        phone,
        message,
      },
    });

    // 2. Отправляем уведомление на почту через Resend
    const { error: mailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ivnaparaolv@gmail.com',
      replyTo: email,
      subject: `Support Ticket #${newTicket.id}: ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#E50000;">New Support Request</h2>
          <p><b>Ticket ID:</b> ${newTicket.id}</p>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ''}
          <hr style="border-color:#eee;margin:20px 0;"/>
          <p style="white-space:pre-wrap;">${message}</p>
        </div>
      `,
    });

    // Если письмо не ушло, логируем ошибку, но тикет в базе уже есть
    if (mailError) {
      console.error('Resend error:', mailError.message);
    }

    // Возвращаем ticketId, который так ждет фронтенд
    return NextResponse.json({ success: true, ticketId: newTicket.id });
  } catch (error) {
    console.error('Support POST error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
