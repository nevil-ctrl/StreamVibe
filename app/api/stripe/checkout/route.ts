import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

// Цены для каждого плана (в центах)
// $0.25 для демонстрации — меняй на реальные цены
export const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  BASIC: { amount: 25, name: 'Basic Plan' },
  STANDARD: { amount: 25, name: 'Standard Plan' },
  PREMIUM: { amount: 25, name: 'Premium Plan' },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PLAN_PRICES[plan].name,
              description: `StreamVibe ${PLAN_PRICES[plan].name} subscription`,
            },
            unit_amount: PLAN_PRICES[plan].amount, // 25 центов
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan,
      },
      success_url: `${appUrl}/subscriptions?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/subscriptions?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
