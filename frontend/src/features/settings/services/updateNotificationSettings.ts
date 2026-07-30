import { supabase } from "@/src/lib/supabase";

interface UpdateNotificationSettingsData {
  business_id: string;

  whatsapp_orders: boolean;
  email_orders: boolean;
  browser_notifications: boolean;
  low_stock_alerts: boolean;
  daily_sales_summary: boolean;
}

export async function updateNotificationSettings(
  data: UpdateNotificationSettingsData
) {
  const { error } = await supabase
    .from("notification_settings")
    .upsert(data, {
      onConflict: "business_id",
    });

  if (error) throw error;
}
