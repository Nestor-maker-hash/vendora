import { supabase } from "@/src/lib/supabase";

import { SubscriptionPlan } from "../types/subscription";

export async function getPlans(): Promise<
  SubscriptionPlan[]
> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("monthly_price");

  if (error) {
    throw error;
  }

  return (data ?? []) as SubscriptionPlan[];
}
