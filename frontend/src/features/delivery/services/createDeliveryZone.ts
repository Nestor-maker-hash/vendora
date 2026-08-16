import { supabase } from "@/src/lib/supabase";
import type { DeliveryZone } from "../types/deliveryZone";

interface CreateDeliveryZoneData {
  businessId: string;
  location: string;
  price: number;
  freeDelivery: boolean;
}

export async function createDeliveryZone(
  data: CreateDeliveryZoneData
): Promise<DeliveryZone> {
  const location = data.location.trim();

  if (!location) {
    throw new Error("Delivery location is required.");
  }

  if (!data.freeDelivery && data.price < 0) {
    throw new Error("Delivery price cannot be negative.");
  }

  const { data: zone, error } = await supabase
    .from("delivery_zones")
    .insert({
      business_id: data.businessId,
      location,
      price: data.price,
      free_delivery: data.freeDelivery,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A delivery zone with this location already exists."
      );
    }

    throw error;
  }

  return zone as DeliveryZone;
}
