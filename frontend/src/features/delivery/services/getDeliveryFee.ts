import { supabase } from "@/src/lib/supabase";
import type { DeliveryZone } from "../types/deliveryZone";

export async function getDeliveryFee(
  businessId: string,
  location: string
): Promise<DeliveryZone | null> {
  const normalizedLocation = location.trim().toLowerCase();

  if (!normalizedLocation) {
    return null;
  }

  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("business_id", businessId)
    .ilike("location", normalizedLocation)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DeliveryZone | null;
}
