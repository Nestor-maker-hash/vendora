export const NotificationType = {
  NEW_ORDER: "new_order",
  PAYMENT_SUBMITTED: "payment_submitted",
  WELCOME: "welcome",
  LOW_STOCK: "low_stock",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
