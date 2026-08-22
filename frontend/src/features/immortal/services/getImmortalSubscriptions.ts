import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalSubscriptions() {
  const [
    subscriptionsResult,
    plansResult,
    businessesResult,
  ] = await Promise.all([
    supabaseServer
      .from("business_subscriptions")
      .select(
        "id, business_id, plan_id, status, started_at, expires_at, created_at"
      )
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("subscription_plans")
      .select(
        "id, name, description, monthly_price, yearly_price, is_active, is_public, sort_order"
      )
      .order("sort_order"),

    supabaseServer
      .from("businesses")
      .select("id, name, slug, currency"),
  ]);

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load platform subscriptions: ${subscriptionsResult.error.message}`
    );
  }

  if (plansResult.error) {
    throw new Error(
      `Failed to load subscription plans: ${plansResult.error.message}`
    );
  }

  if (businessesResult.error) {
    throw new Error(
      `Failed to load subscription merchants: ${businessesResult.error.message}`
    );
  }

  const plans = plansResult.data ?? [];
  const businesses = businessesResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];

  const planMap = new Map(
    plans.map((plan) => [plan.id, plan])
  );

  const businessMap = new Map(
    businesses.map((business) => [business.id, business])
  );

  return subscriptions.map((subscription) => ({
    ...subscription,
    plan: planMap.get(subscription.plan_id) ?? null,
    business: businessMap.get(subscription.business_id) ?? null,
  }));
}
