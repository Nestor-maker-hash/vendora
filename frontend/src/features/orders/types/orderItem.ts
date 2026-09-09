export interface OrderItem {
  id: string;

  order_id: string;
  product_id: string;

  product_name: string;

  price: number;
  merchant_price: number;
  commission_percentage: number;
  commission_amount: number;
  quantity: number;

  created_at: string;
}
