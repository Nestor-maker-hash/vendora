import { supabase } from "@/src/lib/supabase";
import { Product } from "../types/product";

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  minimum_order_quantity?: number;
  image_url?: string;
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User not authenticated.");
  }

  const response = await fetch(
    "/api/products",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(input),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ??
        "Failed to create product."
    );
  }

  return result.product as Product;
}
