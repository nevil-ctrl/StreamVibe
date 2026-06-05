import { Suspense } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import SubscriptionsClient from './SubscriptionsClient';

export default async function SubscriptionsPage() {
  const session = await auth();

  let currentPlan: string | null = null;
  let subscriptionStatus: string | null = null;
  let expiresAt: string | null = null;

  if (session?.user?.id) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription) {
      currentPlan = subscription.plan;
      subscriptionStatus = subscription.status;
      expiresAt = subscription.expiresAt.toISOString();
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-[#999999]">
          Загрузка...
        </div>
      }>
      <SubscriptionsClient
        currentPlan={currentPlan}
        subscriptionStatus={subscriptionStatus}
        expiresAt={expiresAt}
        isLoggedIn={!!session?.user}
      />
    </Suspense>
  );
}
