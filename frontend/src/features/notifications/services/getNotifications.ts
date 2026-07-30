import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";
import { Notification } from "../types/notification";

export async function getNotifications(): Promise<Notification[]> {
  const business = await getCurrentBusiness();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []) as Notification[];
}
