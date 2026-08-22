import { dispatchNotificationServer } from "@/src/services/serverNotificationDispatcher";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";
import { lowStockTemplate } from "../templates/lowStock";

export async function notifyLowStock(
  businessId: string,
  businessName: string,
  productName: string,
  stock: number,
  productId: string
) {
 
const notification = lowStockTemplate(
  productName,
  stock
);

  await dispatchNotificationServer({
    businessId,

    title: notification.title,

    message: notification.message,

    whatsapp: notification.whatsapp,

    type: NotificationType.LOW_STOCK,

    link: `/dashboard/products/${productId}`,
  });
}
