import { supabase } from "@/src/lib/supabase";
import type { DeliveryZone } from "../types/deliveryZone";
import { checkSubscriptionLimit } from "@/src/features/subscriptions/services/checkSubscriptionLimit";

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

  const { count: deliveryZoneCount, error: deliveryZoneCountError } =
    await supabase
      .from("delivery_zones")
      .select("id", { count: "exact", head: true })
      .eq("business_id", data.businessId);

  if (deliveryZoneCountError) {
    throw deliveryZoneCountError;
  }

  const deliveryZoneLimit = await checkSubscriptionLimit(
    data.businessId,
    "max_delivery_zones",
    deliveryZoneCount ?? 0
  );

  if (!deliveryZoneLimit.allowed) {
    throw new Error(
      `You've reached the ${deliveryZoneLimit.planName} plan limit of ${deliveryZoneLimit.limit} delivery zones. Upgrade your plan to add more delivery zones.`
    );
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
