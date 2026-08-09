import { Order } from "@/src/features/orders/types/order";
import { dispatchNotificationServer } from "@/src/services/serverNotificationDispatcher";
import { paymentSubmittedTemplate } from "../templates/paymentSubmitted";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";

export async function notifyPaymentSubmitted(
  order: Order,
  currency: string
) {
  const notification =
    paymentSubmittedTemplate(
      order,
      currency
    );

  await dispatchNotificationServer({
    businessId: order.business_id,

    title: notification.title,

    message: notification.message,

    whatsapp: notification.whatsapp,

    type: NotificationType.PAYMENT_SUBMITTED,

    link: `/dashboard/orders/${order.id}`,
  });
}
