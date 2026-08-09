import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getNotificationSettingsServer(
  businessId: string
) {
  const { data, error } = await supabaseServer
    .from("notification_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (error) throw error;

  return data;
}
