import { supabase } from "@/src/lib/supabase";
import type { DeliveryZone } from "../types/deliveryZone";

interface CreateDeliveryZoneData {
  location: string;
  price: number;
  freeDelivery: boolean;
}

export async function createDeliveryZone(
  data: CreateDeliveryZoneData
): Promise<DeliveryZone> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User not authenticated.");
  }

  const response = await fetch(
    "/api/delivery-zones",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ??
        "Failed to create delivery zone."
    );
  }

  return result.zone as DeliveryZone;
}
