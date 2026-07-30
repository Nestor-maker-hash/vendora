export interface Product {
  id: string;
  business_id: string;

  name: string;
  description: string | null;

  price: number;
  stock: number;

  image_url: string | null;

  created_at: string;
}
