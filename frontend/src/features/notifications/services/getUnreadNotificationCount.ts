import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getUnreadNotificationCount() {
  const business = await getCurrentBusiness();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("business_id", business.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
