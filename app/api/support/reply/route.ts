import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { auth } from '@/auth';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { ticketId, message, fromAdmin } = await req.json();

    if (!ticketId || !message.trim()) {
      return NextResponse.json(
        { error: 'Не все поля заполнены' },
        { status: 400 },
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Обращение не найдено' },
        { status: 404 },
      );
    }

    // Создаем запись ответа в базе
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        message,
        fromAdmin: !!fromAdmin,
      },
    });

    // Если отвечает админ — закрываем тикет и шлем email
    if (fromAdmin) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'RESOLVED' },
      });

      await resend.emails.send({
        from: 'StreamVibe Support <onboarding@resend.dev>',
        to: ticket.email,
        subject: `Ответ по обращению #${ticketId.slice(0, 8).toUpperCase()}`,
        html: `
          <div style="background-color: #0F0F0F; color: #FFFFFF; padding: 30px; font-family: sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #1F1F1F;">
            <h2 style="color: #E50000; margin-bottom: 20px;">Поддержка StreamVibe</h2>
            <p style="font-size: 16px; color: #E4E4E7;">Здравствуйте, <strong>${ticket.firstName}</strong>!</p>
            <div style="background-color: #161617; padding: 15px; border-radius: 8px; border-left: 4px solid #E50000; margin: 20px 0; color: #E4E4E7; font-size: 14px;">
              <strong>Ответ:</strong> ${message}
            </div>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/user/support" 
               style="background-color: #E50000; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Перейти в историю обращений
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Ошибка на бэкенде в reply:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
