export type PaymentMethod =
  | "paystack"
  | "bank_transfer"
  | "pay_on_delivery";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  business_id: string;

  customer_name: string;
  customer_phone: string;
  customer_email: string | null;

  state: string;
  city: string;
  address: string;
  notes: string | null;

  subtotal: number;
  delivery_fee: number;
  total: number;

  status: OrderStatus;

  created_at: string;

  business: {
    currency: string;
  };
payment_method: PaymentMethod;

payment_status: PaymentStatus;

payment_reference: string | null;

paid_at: string | null;
payment_submitted_at: string | null;
}
