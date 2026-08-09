import { supabase } from "@/src/lib/supabase";

interface UpdateBusinessData {
  id: string;

  name: string;
  slug: string;
  
  phone?: string;
  currency?: string;
  
  pay_on_delivery_enabled?: boolean;

bank_transfer_enabled?: boolean;

online_payment_enabled?: boolean;

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
  const response = await supabase
    .from("businesses")
    .update({
      name: data.name,
      slug: data.slug,
      phone: data.phone,
      currency: data.currency,
pay_on_delivery_enabled:
  data.pay_on_delivery_enabled,

bank_transfer_enabled:
  data.bank_transfer_enabled,

online_payment_enabled:
  data.online_payment_enabled,

bank_name: data.bank_name,

account_name: data.account_name,

account_number: data.account_number,

      description: data.description,
      logo_url: data.logo_url,
      banner_url: data.banner_url,
    })
    .eq("id", data.id)
    .select();


  if (response.error) {
    throw response.error;
  }
}
