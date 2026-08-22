import { supabase } from "@/src/lib/supabase";

import { SubscriptionPlan } from "../types/subscription";

export async function getPlans(): Promise<
  SubscriptionPlan[]
> {

const { data, error } = await supabase
  .from("subscription_plans")
  .select("*")
  .eq("is_active", true)
  .eq("is_public", true)
  .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as SubscriptionPlan[];
}
