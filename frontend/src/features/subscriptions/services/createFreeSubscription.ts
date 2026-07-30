import { supabase } from "@/src/lib/supabase";

export async function createFreeSubscription(
  businessId: string
) {
  const { data: plan, error: planError } =
    await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", "Free")
      .single();

  if (planError) throw planError;

  const { error } = await supabase
    .from("business_subscriptions")
    .insert({
      business_id: businessId,
      plan_id: plan.id,
      status: "active",
    });

  if (error) throw error;
}
