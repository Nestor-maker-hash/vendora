import { supabase } from "@/src/lib/supabase";

export interface SubscriptionPayment {
  id: string;
  business_id: string;
  plan_id: string;
  provider: string;
  transaction_reference: string;
  provider_transaction_id: string | null;
  amount: number;
  currency: string;
  canonical_amount: number | null;
  canonical_currency: string | null;
  exchange_rate: number | null;
  billing_cycle: "monthly" | "yearly" | string;
  status: string;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
  subscription_plans?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export async function getSubscriptionPayments(
  businessId: string
): Promise<SubscriptionPayment[]> {
  const { data, error } = await supabase
    .from("subscription_payments")
    .select(`
      *,
      subscription_plans (
        id,
        name,
        description
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      error.message || "Failed to load subscription payments."
    );
  }

  return (data ?? []) as SubscriptionPayment[];
}
