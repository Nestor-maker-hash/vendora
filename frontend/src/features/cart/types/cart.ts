import { Product } from "@/src/features/products/types/product";

export interface CartItem extends Product {
  quantity: number;
}
