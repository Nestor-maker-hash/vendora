export interface OrderItem {
  id: string;

  order_id: string;
  product_id: string;

  product_name: string;

  price: number;
  quantity: number;

  created_at: string;
}
