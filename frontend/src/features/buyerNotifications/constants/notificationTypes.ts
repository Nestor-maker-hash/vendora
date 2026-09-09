export const BuyerNotificationType = {
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_PROCESSING: "order_processing",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
} as const;

export type BuyerNotificationType =
  (typeof BuyerNotificationType)[keyof typeof BuyerNotificationType];
