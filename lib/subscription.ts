import { prisma, withRetry } from '@/lib/prisma';

type SubscriptionSnapshot = {
  status: string;
  expiresAt: Date;
} | null;

export function hasActiveSubscription(
  subscription: SubscriptionSnapshot,
): boolean {
  if (!subscription) return false;
  return (
    subscription.status === 'ACTIVE' && subscription.expiresAt > new Date()
  );
}

export async function fetchUserHasActiveSubscription(
  userId: string,
): Promise<boolean> {
  try {
    const subscription = await withRetry(
      () =>
        prisma.subscription.findUnique({
          where: { userId },
          select: { status: true, expiresAt: true },
        }),
      3,
    );
    return hasActiveSubscription(subscription);
  } catch (error) {
    console.error(
      '[fetchUserHasActiveSubscription] Database error:',
      error instanceof Error ? error.message : error,
    );
    // On DB error, deny access (safer than allowing unverified)
    return false;
  }
  }

export async function hasWatchAccess(userId: string, role?: string) {
  if (role === 'ADMIN' || role === 'SUPERADMIN') return true;
  return fetchUserHasActiveSubscription(userId);
}
