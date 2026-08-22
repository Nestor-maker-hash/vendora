import { WhatsAppTemplatePayload } from "../types/whatsapp";

export function lowStockTemplate(
  productName: string,
  stock: number
): {
  title: string;
  message: string;
  whatsapp: WhatsAppTemplatePayload;
} {
  return {
    title: "⚠️ Low Stock",

    message: `${productName} is running low. Only ${stock} item(s) remaining.`,

    whatsapp: {
      template: "vendora_low_stock",

      variables: [
        productName,
        String(stock),
      ],
    },
  };
}
