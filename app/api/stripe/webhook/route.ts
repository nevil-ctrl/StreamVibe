import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[WEBHOOK_SIGNATURE_ERROR]', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'BASIC' | 'STANDARD' | 'PREMIUM';

        if (!userId || !plan) break;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const amount = session.amount_total ?? 25;

        // Платёж
        await prisma.payment.create({
          data: {
            userId,
            amount,
            currency: session.currency?.toUpperCase() ?? 'USD',
            plan,
            status: 'SUCCESS',
          },
        });

        // Подписка
        await prisma.subscription.upsert({
          where: { userId },
          update: { plan, status: 'ACTIVE', expiresAt },
          create: { userId, plan, status: 'ACTIVE', expiresAt },
        });

        const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();
        const amountFormatted = `$${(amount / 100).toFixed(2)}`;

        // Уведомление об оплате
        await prisma.notification.create({
          data: {
            userId,
            type: 'PAYMENT_SUCCESS',
            title: 'Оплата прошла успешно',
            message: `${planLabel} Plan активирован. Списано ${amountFormatted}. Следующее продление: ${expiresAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}.`,
          },
        });

        console.log(
          `[WEBHOOK] Subscription activated: user=${userId} plan=${plan}`,
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const customer = (await stripe.customers.retrieve(
          customerId,
        )) as Stripe.Customer;
        if (!customer.email) break;

        const user = await prisma.user.findUnique({
          where: { email: customer.email },
        });
        if (!user) break;

        await prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: 'EXPIRED' },
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'PAYMENT_FAILED',
            title: 'Ошибка оплаты',
            message:
              'Не удалось продлить подписку. Проверьте платёжные данные и попробуйте снова.',
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customer = (await stripe.customers.retrieve(
          sub.customer as string,
        )) as Stripe.Customer;
        if (!customer.email) break;

        const user = await prisma.user.findUnique({
          where: { email: customer.email },
        });
        if (!user) break;

        await prisma.subscription.updateMany({
          where: { userId: user.id },
          data: { status: 'CANCELLED' },
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SUBSCRIPTION_CANCELLED',
            title: 'Подписка отменена',
            message:
              'Ваша подписка была отменена. Вы можете оформить новую в любое время.',
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK_HANDLER_ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
