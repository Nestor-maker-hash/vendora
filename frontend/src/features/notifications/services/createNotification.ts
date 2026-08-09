import { supabaseServer } from "@/src/lib/supabaseServer";

interface CreateNotificationData {
  businessId: string;

  title: string;
  message: string;

  type: string;

  link?: string;
}

export async function createNotification(
  data: CreateNotificationData
) {

  const { error } = await supabaseServer
    .from("notifications")
    .insert({
      business_id: data.businessId,

      title: data.title,
      message: data.message,

      type: data.type,

      link: data.link,
    });

  if (error) {
    throw error;
  }
}
