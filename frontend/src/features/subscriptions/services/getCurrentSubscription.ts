import { supabase } from "@/src/lib/supabase";

import { BusinessSubscription } from "../types/subscription";

export async function getCurrentSubscription(
  businessId: string
): Promise<BusinessSubscription | null> {
  const { data, error } = await supabase
    .from("business_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("business_id", businessId)
    .single();

  if (error) {
    return null;
  }

  return data as BusinessSubscription;
}
