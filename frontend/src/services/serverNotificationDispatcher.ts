import { createNotification } from "@/src/features/notifications/services/createNotification";
import { getBusinessByIdServer } from "@/src/features/business/services/getBusinessByIdServer";
import {
  sendWhatsApp,
  sendWhatsAppTemplate,
  WhatsAppTemplateMessage,
} from "@/src/services/providers/whatsappProvider";
import { getNotificationSettingsServer } from "@/src/features/settings/services/getNotificationSettingsServer";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";
import { WhatsAppTemplatePayload } from "@/src/features/notifications/types/whatsapp";
import { sendPushNotification } from "@/src/services/push/pushService";

interface DispatchNotificationData {
  businessId: string;
  title: string;
  message: string;
  whatsapp?: WhatsAppTemplatePayload;
  whatsappMessage?: string;
  type: NotificationType;
  link?: string;
}

export async function dispatchNotificationServer(
  data: DispatchNotificationData
) {
  // Always create the in-app notification.
  await createNotification(data);

  try {
    const business = await getBusinessByIdServer(
      data.businessId
    );

    const settings =
      await getNotificationSettingsServer(
        data.businessId
      );

    // WhatsApp
    const shouldSendWhatsApp =
      data.type === NotificationType.LOW_STOCK
        ? settings.low_stock_alerts
        : settings.whatsapp_orders;

    if (shouldSendWhatsApp && business.phone) {
      if (data.whatsapp) {
        const templateData: WhatsAppTemplateMessage = {
          to: business.phone,
          template: data.whatsapp.template,
          variables: [
            business.name,
            ...data.whatsapp.variables,
          ],
          buttonVariables:
            data.whatsapp.buttonVariables,
        };

        await sendWhatsAppTemplate(
          templateData
        );
      } else {
        await sendWhatsApp({
          to: business.phone,
          message:
            data.whatsappMessage ??
            `${data.title}\n\n${data.message}`,
        });
      }
    }

    // Web Push
    if (settings.browser_notifications) {
      await sendPushNotification({
        businessId: data.businessId,
        title: data.title,
        body: data.message,
        url:
          data.link ??
          "/dashboard/notifications",
        type: data.type,
      });
    }
  } catch (error) {
    console.error(
      "Notification delivery failed:",
      error
    );
  }
}
