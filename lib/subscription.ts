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
