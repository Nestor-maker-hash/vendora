import { supabase } from "@/src/lib/supabase";

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);

  return result;
}

export async function changeSubscriptionPlan(
  businessId: string,
  planId: string
) {
  const { data: plan, error: planError } =
    await supabase
      .from("subscription_plans")
      .select(`
        id,
        name,
        monthly_price,
        is_active,
        is_public
      `)
      .eq("id", planId)
      .eq("is_active", true)
      .eq("is_public", true)
      .single();

  if (planError || !plan) {
    throw new Error(
      "Selected subscription plan is unavailable."
    );
  }

  const { data: existingSubscription, error: subscriptionError } =
    await supabase
      .from("business_subscriptions")
      .select("id")
      .eq("business_id", businessId)
      .single();

  if (subscriptionError || !existingSubscription) {
    throw new Error("Subscription not found.");
  }

  const now = new Date();

  const isFreePlan = Number(plan.monthly_price) === 0;

  const expiresAt = isFreePlan
    ? null
    : addMonths(now, 1).toISOString();

  const { data, error } = await supabase
    .from("business_subscriptions")
    .update({
      plan_id: plan.id,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", existingSubscription.id)
    .select(`
      *,
      subscription_plans (*)
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
