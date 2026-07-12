import { supabase } from "@/src/lib/supabase";

export async function getProductsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
