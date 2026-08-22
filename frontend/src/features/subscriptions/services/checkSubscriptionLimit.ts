import { getEffectiveSubscription } from "./getEffectiveSubscription";

export type SubscriptionLimit =
  | "max_products"
  | "max_orders_per_month"
  | "max_customers"
  | "max_delivery_zones"
  | "max_staff";

export interface SubscriptionLimitResult {
  allowed: boolean;
  limit: number | null;
  current: number;
  remaining: number | null;
  planName: string;
}

export async function checkSubscriptionLimit(
  businessId: string,
  limitKey: SubscriptionLimit,
  current: number
): Promise<SubscriptionLimitResult> {

const subscription =
  await getEffectiveSubscription(businessId);

  if (!subscription?.subscription_plans) {
    throw new Error("No active subscription found.");
  }

  if (subscription.status !== "active") {
    throw new Error("Your subscription is not active.");
  }

  const plan = subscription.subscription_plans;
  const limit = plan[limitKey];

  // null means unlimited.
  if (limit === null) {
    return {
      allowed: true,
      limit: null,
      current,
      remaining: null,
      planName: plan.name,
    };
  }

  const remaining = Math.max(limit - current, 0);

  return {
    allowed: current < limit,
    limit,
    current,
    remaining,
    planName: plan.name,
  };
}
