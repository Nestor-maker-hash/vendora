import { supabase } from "@/src/lib/supabase";

export async function acknowledgeStoreReady(
  businessId: string
) {
  const { error } = await supabase
    .from("businesses")
    .update({
      store_ready_acknowledged: true,
    })
    .eq("id", businessId);

  if (error) {
    throw error;
  }
}
