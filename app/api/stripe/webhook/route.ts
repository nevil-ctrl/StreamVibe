import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// ВАЖНО: отключаем body parser Next.js — Stripe требует raw body для верификации подписи
export const config = {
  api: { bodyParser: false },
};

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
      // Успешная оплата — активируем/создаём подписку
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'BASIC' | 'STANDARD' | 'PREMIUM';

        if (!userId || !plan) break;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Создаём запись об оплате
        await prisma.payment.create({
          data: {
            userId,
            amount: session.amount_total ?? 25,
            currency: session.currency?.toUpperCase() ?? 'USD',
            plan,
            status: 'SUCCESS',
          },
        });

        // Upsert подписки — создаём если нет, обновляем если есть
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: 'ACTIVE',
            expiresAt,
          },
          create: {
            userId,
            plan,
            status: 'ACTIVE',
            expiresAt,
          },
        });

        console.log(
          `[WEBHOOK] Subscription activated for user ${userId}, plan ${plan}`,
        );
        break;
      }

      // Платёж не прошёл
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Находим пользователя по email из Stripe customer
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

        console.log(`[WEBHOOK] Payment failed for user ${user.id}`);
        break;
      }

      // Подписка отменена
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

        console.log(`[WEBHOOK] Subscription cancelled for user ${user.id}`);
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
