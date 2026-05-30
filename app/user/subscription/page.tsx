import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SubscriptionClient from './Subscriptionclient';

export default async function UserSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const [subscription, payments] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <SubscriptionClient
      subscription={
        subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              expiresAt: subscription.expiresAt.toISOString(),
              createdAt: subscription.createdAt.toISOString(),
            }
          : null
      }
      payments={payments.map((p) => ({
        id: p.id,
        plan: p.plan,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
      userEmail={session.user.email}
    />
  );
}
