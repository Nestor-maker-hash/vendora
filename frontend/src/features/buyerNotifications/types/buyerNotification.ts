import type { BuyerNotificationType } from "../constants/notificationTypes";

export interface BuyerNotification {
  id: string;
  buyer_id: string;
  business_id: string;
  order_id: string;
  title: string;
  message: string;
  type: BuyerNotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
