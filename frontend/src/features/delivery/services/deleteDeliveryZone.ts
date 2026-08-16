import { supabase } from "@/src/lib/supabase";

export async function deleteDeliveryZone(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("delivery_zones")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
