import { supabase } from "@/src/lib/supabase";
import type { DeliveryZone } from "../types/deliveryZone";

export async function getDeliveryZones(
  businessId: string
): Promise<DeliveryZone[]> {
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as DeliveryZone[];
}
