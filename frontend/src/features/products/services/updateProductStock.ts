import { supabase } from "@/src/lib/supabase";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import { notifyLowStock } from "@/src/features/notifications/services/notifyLowStock";

export async function updateProductStock(
  productId: string,
  quantityChange: number
) {
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, business_id, name, stock, minimum_order_quantity"
    )
    .eq("id", productId)
    .single();

  if (error) throw error;

  const currentStock = product.stock;
  const newStock = currentStock + quantityChange;

  console.log({
    productId,
    currentStock,
    quantityChange,
    newStock,
    minimumOrderQuantity:
      product.minimum_order_quantity,
  });

  if (newStock < 0) {
    throw new Error(
      "Not enough stock available."
    );
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      stock: newStock,
    })
    .eq("id", productId);

  if (updateError) {
    console.error(updateError);
    throw updateError;
  }

  /*
   * Low-stock alerts are based on each product's
   * own minimum order quantity.
   *
   * A minimum of 1 is the default and does NOT
   * create a low-stock threshold.
   *
   * Example:
   *
   * minimum = 20
   * 21 → 20 = no alert
   * 20 → 19 = alert
   * 19 → 18 = no duplicate alert
   */
  const minimumOrderQuantity =
    product.minimum_order_quantity ?? 1;

  const crossedLowStockThreshold =
    minimumOrderQuantity > 1 &&
    currentStock >= minimumOrderQuantity &&
    newStock < minimumOrderQuantity;

  if (crossedLowStockThreshold) {
    try {
      const business = await getBusinessById(
        product.business_id
      );

      await notifyLowStock(
        business.id,
        business.name,
        product.name,
        newStock,
        product.id
      );
    } catch (err) {
      console.error(
        "Low-stock notification failed:",
        err
      );
    }
  }
}
