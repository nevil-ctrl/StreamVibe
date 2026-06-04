import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = String(session?.user?.role || '').toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'SUPERADMIN';

  if (!session || !hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  return NextResponse.json({ success: true, id });
}
const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (
    !session ||
    !['ADMIN', 'SUPERADMIN'].includes(
      String(session?.user?.role || '').toUpperCase(),
    )
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { status, message } = await req.json();

  // Получаем тикет для email
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { email: true, firstName: true, userId: true }, // ✅ добавил userId
  });

  if (message && ticket) {
    await prisma.ticketReply.create({
      data: { ticketId: id, message, fromAdmin: true },
    });

    // ✅ Создаём уведомление в базе
    if (ticket.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'TICKET_REPLY',
          title: 'Ответ на ваше обращение',
          message:
            message.length > 100 ? message.slice(0, 100) + '...' : message,
        },
      });
    }
    // Отправляем email пользователю
    await resend.emails
      .send({
        from: `StreamVibe Support <${process.env.SUPPORT_EMAIL}>`,
        to: ticket.email,
        subject: 'Ответ на ваше обращение — StreamVibe',
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e50000;">StreamVibe Support</h2>
          <p>Привет, ${ticket.firstName}!</p>
          <p>Мы ответили на ваше обращение:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p style="color: #666; font-size: 14px;">С уважением, команда StreamVibe</p>
        </div>
      `,
      })
      .catch(console.error); // не крашим если email не ушёл
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, ticket: updated });
}
