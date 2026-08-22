import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalPlans() {
  const { data, error } = await supabaseServer
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load subscription plans: ${error.message}`
    );
  }

  return data ?? [];
}
