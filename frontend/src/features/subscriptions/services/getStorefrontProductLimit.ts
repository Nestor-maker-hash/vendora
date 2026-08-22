import { supabaseServer } from "@/src/lib/supabaseServer";

interface StorefrontProductLimit {
  productLimit: number | null;
  lockOverLimitProducts: boolean;
}

export async function getStorefrontProductLimit(
  businessId: string
): Promise<StorefrontProductLimit> {
  const [
    subscriptionResult,
    freePlanResult,
    settingsResult,
  ] = await Promise.all([
    supabaseServer
      .from("business_subscriptions")
      .select(`
        status,
        expires_at,
        subscription_plans (
          max_products
        )
      `)
      .eq("business_id", businessId)
      .maybeSingle(),

    supabaseServer
      .from("subscription_plans")
      .select("max_products")
      .eq("name", "Free")
      .eq("is_active", true)
      .maybeSingle(),

    supabaseServer
      .from("platform_settings")
      .select("lock_over_limit_products")
      .maybeSingle(),
  ]);

  if (subscriptionResult.error) {
    throw subscriptionResult.error;
  }

  if (freePlanResult.error) {
    throw freePlanResult.error;
  }

  if (settingsResult.error) {
    throw settingsResult.error;
  }

  const now = new Date();

  const subscription = subscriptionResult.data;

  const isSubscriptionActive =
    subscription?.status === "active" &&
    (
      !subscription.expires_at ||
      new Date(subscription.expires_at) > now
    );

  const activePlan = subscription
    ?.subscription_plans as
    | { max_products: number | null }
    | { max_products: number | null }[]
    | null
    | undefined;

  const plan =
    Array.isArray(activePlan)
      ? activePlan[0]
      : activePlan;

  const productLimit = isSubscriptionActive
    ? plan?.max_products ?? null
    : freePlanResult.data?.max_products ?? null;

  return {
    productLimit,
    lockOverLimitProducts:
      settingsResult.data?.lock_over_limit_products ?? true,
  };
}
