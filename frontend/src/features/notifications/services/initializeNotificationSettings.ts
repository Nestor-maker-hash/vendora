import { supabase } from "@/src/lib/supabase";

export async function initializeNotificationSettings(
  businessId: string
) {
  const { data: existing } = await supabase
    .from("notification_settings")
    .select("business_id")
    .eq("business_id", businessId)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await supabase
    .from("notification_settings")
    .insert({
      business_id: businessId,

      whatsapp_orders: true,
      email_orders: true,
      browser_notifications: true,
      low_stock_alerts: true,
      daily_sales_summary: false,
    });

  if (error) {
    throw error;
  }
}
