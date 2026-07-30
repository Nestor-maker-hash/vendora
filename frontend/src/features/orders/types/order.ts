export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

xport interface Order {
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
}
