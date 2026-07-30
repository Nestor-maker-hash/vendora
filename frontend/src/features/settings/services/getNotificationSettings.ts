import { supabase } from "@/src/lib/supabase";

export async function getNotificationSettings(
  businessId: string
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (error) throw error;

  return data;
}
