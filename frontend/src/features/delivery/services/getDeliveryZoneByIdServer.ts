import { supabaseServer } from "@/src/lib/supabaseServer";
import type { DeliveryZone } from "../types/deliveryZone";

export async function getDeliveryZoneByIdServer(
  businessId: string,
  zoneId: string
): Promise<DeliveryZone | null> {
  if (!businessId || !zoneId) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("delivery_zones")
    .select("*")
    .eq("id", zoneId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DeliveryZone | null;
}
