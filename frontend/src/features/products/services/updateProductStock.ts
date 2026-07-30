import { supabase } from "@/src/lib/supabase";

export async function updateProductStock(
  productId: string,
  quantityChange: number
) {
  const { data: product, error } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (error) throw error;

  const newStock = product.stock + quantityChange;

  if (newStock < 0) {
    throw new Error("Not enough stock available.");
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      stock: newStock,
    })
    .eq("id", productId);

  if (updateError) throw updateError;
}
