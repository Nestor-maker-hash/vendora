export interface Product {
  id: string;
  business_id: string;

  name: string;
  description: string | null;

  // Customer-facing price after Vendora commission
  price: number;

  // Amount the merchant wants to receive
  merchant_price: number | null;

  // Commission used to calculate the customer price
  commission_percentage: number | null;

  stock: number;

  minimum_order_quantity: number;

  image_url: string | null;

  created_at: string;
}
