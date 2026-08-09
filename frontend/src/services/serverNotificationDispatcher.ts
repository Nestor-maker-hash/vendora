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
  await createNotification(data);

  try {
    const business = await getBusinessByIdServer(data.businessId);

    const settings =
      await getNotificationSettingsServer(
        data.businessId
      );

    const shouldSendWhatsApp =
      settings.whatsapp_orders;

    if (
      shouldSendWhatsApp &&
      business.phone
    ) {
      if (data.whatsapp) {
const templateData: WhatsAppTemplateMessage = {
  to: business.phone,
  template: data.whatsapp.template,
variables: [
  business.name,
  ...data.whatsapp.variables,
],
  buttonVariables: data.whatsapp.buttonVariables,
};
        await sendWhatsAppTemplate(templateData);
      } else {
        await sendWhatsApp({
          to: business.phone,
          message:
            data.whatsappMessage ??
            `${data.title}\n\n${data.message}`,
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

