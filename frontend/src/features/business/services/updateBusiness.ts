import { supabase } from "@/src/lib/supabase";

interface UpdateBusinessData {
  id: string;

  name?: string;
  slug?: string;

  phone?: string;
  currency?: string;

  pay_on_delivery_enabled?: boolean;
  online_payment_enabled?: boolean;

  paystack_subaccount_code?: string;
  paystack_bank_code?: string | null;
  paystack_connected?: boolean;
  paystack_connected_at?: string | null;

  bank_name?: string;
  account_name?: string;
  account_number?: string;

  description?: string;

  logo_url?: string;
  banner_url?: string;
}

export async function updateBusiness(
  data: UpdateBusinessData
) {
  const { id, ...updates } = data;

  const response = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}
