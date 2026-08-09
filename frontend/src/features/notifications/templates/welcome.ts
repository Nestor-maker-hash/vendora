import { WhatsAppTemplatePayload } from "../types/whatsapp";

export function welcomeTemplate(
  merchantName: string,
  businessName: string
): {
  title: string;
  message: string;
  whatsapp: WhatsAppTemplatePayload;
} {
  return {
    title: "🎉 Welcome to Vendora",

    message: `Welcome to Vendora! Your business "${businessName}" has been successfully created.`,

    whatsapp: {
      template: "vendora_welcome",

      variables: [
        merchantName,
        businessName,
      ],
    },
  };
}
