import { supabase } from "@/src/lib/supabase";
import type { BuyerNotification } from "../types/buyerNotification";

export async function getBuyerNotifications(): Promise<BuyerNotification[]> {
  const { data, error } = await supabase
    .from("buyer_notifications")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as BuyerNotification[];
}
