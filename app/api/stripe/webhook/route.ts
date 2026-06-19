import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma, withRetry } from '@/lib/prisma';
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

        if (!userId || !plan) {
          console.warn('[WEBHOOK] Missing userId or plan in metadata', { userId, plan });
          break;
        }

        // Verify user exists
        const user = await withRetry(
          () =>
            prisma.user.findUnique({
              where: { id: userId },
              select: { id: true, email: true },
            }),
          3,
        );

        if (!user) {
          console.warn('[WEBHOOK] User not found', { userId });
          break;
        }

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const amount = session.amount_total ?? 25;

        try {
          // Платёж
          await withRetry(
            () =>
              prisma.payment.create({
                data: {
                  userId,
                  amount,
                  currency: session.currency?.toUpperCase() ?? 'USD',
                  plan,
                  status: 'SUCCESS',
                },
              }),
            3,
          );

          // Подписка
          await withRetry(
            () =>
              prisma.subscription.upsert({
                where: { userId },
                update: { plan, status: 'ACTIVE', expiresAt },
                create: { userId, plan, status: 'ACTIVE', expiresAt },
              }),
            3,
          );

          const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();
          const amountFormatted = `$${(amount / 100).toFixed(2)}`;

          // Уведомление об оплате - ТОЛЬКО для пользователя, который купил
          await withRetry(
            () =>
              prisma.notification.create({
                data: {
                  userId,
                  type: 'PAYMENT_SUCCESS',
                  title: 'Оплата прошла успешно',
                  message: `${planLabel} Plan активирован. Списано ${amountFormatted}. Следующее продление: ${expiresAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}.`,
                },
              }),
            3,
          );

          console.log(
            `[WEBHOOK] Subscription activated: user=${userId} plan=${plan}`,
          );
        } catch (error) {
          console.error('[WEBHOOK] Error processing subscription', { userId, error });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        try {
          const customer = (await stripe.customers.retrieve(
            customerId,
          )) as Stripe.Customer;
          
          if (!customer.email) {
            console.warn('[WEBHOOK] No email in customer object');
            break;
          }

          const user = await prisma.user.findUnique({
            where: { email: customer.email },
            select: { id: true },
          });

          if (!user) {
            console.warn('[WEBHOOK] User not found by email', { email: customer.email });
            break;
          }

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
        } catch (error) {
          console.error('[WEBHOOK] Error processing payment failed', { customerId, error });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        try {
          const customer = (await stripe.customers.retrieve(
            customerId,
          )) as Stripe.Customer;
          
          if (!customer.email) {
            console.warn('[WEBHOOK] No email in customer object for subscription deleted');
            break;
          }

          const user = await prisma.user.findUnique({
            where: { email: customer.email },
            select: { id: true },
          });

          if (!user) {
            console.warn('[WEBHOOK] User not found by email for subscription deleted', { email: customer.email });
            break;
          }

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
        } catch (error) {
          console.error('[WEBHOOK] Error processing subscription deleted', { customerId, error });
        }

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
