import { supabaseServer } from "@/src/lib/supabaseServer";
import type { DeliveryZone } from "../types/deliveryZone";

export async function getDeliveryZoneByLocationServer(
  businessId: string,
  location: string
): Promise<DeliveryZone | null> {
  const normalizedLocation = location.trim().toLowerCase();

  if (!businessId || !normalizedLocation) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from("delivery_zones")
    .select("*")
    .eq("business_id", businessId);

  if (error) {
    throw error;
  }

  const zones = (data ?? []) as DeliveryZone[];

  const zone = zones.find(
    (item) =>
      item.location.trim().toLowerCase() === normalizedLocation
  );

  return zone ?? null;
}
