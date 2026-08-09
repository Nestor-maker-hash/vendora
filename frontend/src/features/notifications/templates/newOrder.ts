import { Order } from "@/src/features/orders/types/order";
import { formatCurrency } from "@/src/utils/formatCurrency";

export function newOrderTemplate(
  order: Order,
  currency: string
) {
  const amount = formatCurrency(
    Number(order.total),
    currency
  );

  return {
    title: "🛒 New Order",

    message: `${order.customer_name} placed an order worth ${amount}`,

    whatsapp: {
  template: "vendora_new_order",

  variables: [
    order.customer_name,
    amount,
    order.id,
  ],

  buttonVariables: [
    `/dashboard/orders/${order.id}`,
  ],
},
  };
}
