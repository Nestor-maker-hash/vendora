import { supabase } from "@/src/lib/supabase";

interface UpdateProductData {
  name: string;
  description: string;
  price: number;
  merchant_price: number;
  stock: number;
  minimum_order_quantity: number;
  image_url?: string | null;
}

export async function updateProduct(
  id: string,
  product: UpdateProductData
) {
  if (
    !Number.isInteger(product.minimum_order_quantity) ||
    product.minimum_order_quantity < 1
  ) {
    throw new Error(
      "Minimum order quantity must be a whole number of at least 1."
    );
  }

  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) throw error;
}
