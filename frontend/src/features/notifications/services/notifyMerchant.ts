import { Order } from "@/src/features/orders/types/order";
import { createNotification } from "./createNotification";
import { formatCurrency } from "@/src/utils/formatCurrency";

export async function notifyMerchant(
  order: Order,
  currency: string
) {
  await createNotification({
    businessId: order.business_id,

    title: "🛒 New Order",

   message: `${order.customer_name} placed an order worth ${formatCurrency(
  Number(order.total),
  currency
)}`,

    type: "new_order",

    link: `/dashboard/orders/${order.id}`,
  });

  console.log("Merchant notified.");
}
