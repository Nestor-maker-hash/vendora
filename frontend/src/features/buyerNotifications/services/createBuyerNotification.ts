import { supabaseServer } from "@/src/lib/supabaseServer";
import type { BuyerNotificationType } from "../constants/notificationTypes";

interface CreateBuyerNotificationData {
  buyerId: string;
  businessId: string;
  orderId: string;
  title: string;
  message: string;
  type: BuyerNotificationType;
  link?: string;
}

export async function createBuyerNotification(
  data: CreateBuyerNotificationData
): Promise<void> {
  const { error } = await supabaseServer
    .from("buyer_notifications")
    .insert({
      buyer_id: data.buyerId,
      business_id: data.businessId,
      order_id: data.orderId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ?? null,
    });

  if (error) {
    throw error;
  }
}
