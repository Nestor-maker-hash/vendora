import { supabaseServer } from "@/src/lib/supabaseServer";

import {
  BusinessSubscription,
  SubscriptionPlan,
} from "../types/subscription";

interface EffectiveSubscription
  extends Omit<
    BusinessSubscription,
    "subscription_plans"
  > {
  subscription_plans: SubscriptionPlan;
  isExpired: boolean;
}

export async function getEffectiveSubscription(
  businessId: string
): Promise<EffectiveSubscription | null> {
  const { data: subscription, error } =
    await supabaseServer
      .from("business_subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("business_id", businessId)
      .single();

  if (error || !subscription) {
    return null;
  }

  const typedSubscription =
    subscription as BusinessSubscription;

  const currentPlan =
    typedSubscription.subscription_plans;

  if (!currentPlan) {
    return null;
  }

  const hasExpired =
    typedSubscription.expires_at !== null &&
    new Date(typedSubscription.expires_at) <=
      new Date();

  if (!hasExpired) {
    return {
      ...typedSubscription,
      subscription_plans: currentPlan,
      isExpired: false,
    };
  }

  const { data: freePlan, error: freePlanError } =
    await supabaseServer
      .from("subscription_plans")
      .select("*")
      .eq("name", "Free")
      .eq("is_active", true)
      .single();

  if (freePlanError || !freePlan) {
    throw new Error(
      "Free subscription plan could not be loaded."
    );
  }

  return {
    ...typedSubscription,
    plan_id: freePlan.id,
    status: "active",
    expires_at: null,
    subscription_plans:
      freePlan as SubscriptionPlan,
    isExpired: true,
  };
}
