import "server-only";

import { supabaseServer } from "@/src/lib/supabaseServer";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import { notifyLowStock } from "@/src/features/notifications/services/notifyLowStock";

export async function updateProductStock(
  productId: string,
  quantityChange: number
) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  if (
    !Number.isInteger(quantityChange) ||
    quantityChange === 0
  ) {
    throw new Error(
      "Stock quantity change must be a non-zero integer."
    );
  }

  /*
   * Perform the stock change atomically inside PostgreSQL.
   *
   * This prevents race conditions where two orders read the
   * same stock value and both successfully write a new value.
   *
   * The database function also rejects changes that would make
   * stock negative.
   */
  const { data: result, error: stockError } =
    await supabaseServer.rpc(
      "update_product_stock_atomic",
      {
        p_product_id: productId,
        p_quantity_change: quantityChange,
      }
    );

  if (stockError) {
    if (
      stockError.message
        .toLowerCase()
        .includes("not enough stock")
    ) {
      throw new Error(
        "Not enough stock available."
      );
    }

    throw stockError;
  }

  /*
   * The RPC returns the updated product information.
   * We use it to determine whether this stock change crossed
   * the product's low-stock threshold.
   */
  const updatedProduct =
    Array.isArray(result)
      ? result[0]
      : result;

  if (!updatedProduct) {
    throw new Error(
      "Stock was updated but the updated product could not be confirmed."
    );
  }

  const newStock =
    Number(updatedProduct.stock);

  const previousStock =
    newStock - quantityChange;

  const minimumOrderQuantity =
    updatedProduct.minimum_order_quantity ?? 1;

  /*
   * Only alert when crossing from at/above the threshold
   * to below it.
   */
  const crossedLowStockThreshold =
    minimumOrderQuantity > 1 &&
    previousStock >= minimumOrderQuantity &&
    newStock < minimumOrderQuantity;

  if (crossedLowStockThreshold) {
    try {
      const business =
        await getBusinessById(
          updatedProduct.business_id
        );

      await notifyLowStock(
        business.id,
        business.name,
        updatedProduct.name,
        newStock,
        updatedProduct.id
      );
    } catch (err) {
      console.error(
        "Low-stock notification failed:",
        err
      );
    }
  }

  return updatedProduct;
}
