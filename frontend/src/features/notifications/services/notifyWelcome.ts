import { dispatchNotificationServer } from "@/src/services/serverNotificationDispatcher";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";
import { welcomeTemplate } from "../templates/welcome";

export async function notifyWelcome(
  businessId: string,
  businessName: string,
  merchantName: string
) {
  const notification =
    welcomeTemplate(
      merchantName,
      businessName
    );

  await dispatchNotificationServer({
    businessId,

    title: notification.title,

    message: notification.message,

    whatsapp: notification.whatsapp,

    type: NotificationType.WELCOME,

    link: "/dashboard",
  });
}

