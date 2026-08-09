import { supabase } from "@/src/lib/supabase";
import { getProductById } from "./getProductById";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import { notifyLowStock } from "@/src/features/notifications/services/notifyLowStock";

export async function updateProductStock(
  productId: string,
  quantityChange: number
) {
  const { data: product, error } =
    await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

  if (error) throw error;

  const currentStock = product.stock;
  const newStock =
    currentStock + quantityChange;

  console.log({
    productId,
    currentStock,
    quantityChange,
    newStock,
  });

  if (newStock < 0) {
    throw new Error(
      "Not enough stock available."
    );
  }

  const { error: updateError } =
    await supabase
      .from("products")
      .update({
        stock: newStock,
      })
      .eq("id", productId);

  if (updateError) {
    console.error(updateError);
    throw updateError;
  }

  const crossedLowStockThreshold =
    currentStock > 5 && newStock <= 5;

  if (crossedLowStockThreshold) {
    try {
      const productDetails =
        await getProductById(productId);

      const business =
        await getBusinessById(
          productDetails.business_id
        );

      await notifyLowStock(
        business.id,
        business.name,
        productDetails.name,
        newStock,
        productDetails.id
      );
    } catch (err) {
      console.error(
        "Low-stock notification failed:",
        err
      );
    }
  }
}
