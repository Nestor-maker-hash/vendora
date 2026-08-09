import { Order } from "@/src/features/orders/types/order";
import { formatCurrency } from "@/src/utils/formatCurrency";

export function paymentSubmittedTemplate(
  order: Order,
  currency: string
) {
  const amount = formatCurrency(
    Number(order.total),
    currency
  );

  return {
    title: "💳 Payment Submitted",

    message: `${order.customer_name} submitted payment of ${amount}`,

    whatsapp: {
      template: "vendora_payment_submitted",

      variables: [
        order.customer_name,
        order.id,
        amount,
      ],

  buttonVariables: [
  order.id,
],
    },
  };
}
