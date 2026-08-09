import { Order } from "@/src/features/orders/types/order";
import { dispatchNotificationServer } from "@/src/services/serverNotificationDispatcher";
import { newOrderTemplate } from "../templates/newOrder";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";

export async function notifyMerchant(
  order: Order,
  currency: string
) {
  const notification = newOrderTemplate(
    order,
    currency
  );

  await dispatchNotificationServer({
    businessId: order.business_id,

    title: notification.title,

    message: notification.message,
    
    whatsapp: notification.whatsapp,
    
    type: NotificationType.NEW_ORDER,

    link: `/dashboard/orders/${order.id}`,
  });

  console.log("Merchant notified.");
}
