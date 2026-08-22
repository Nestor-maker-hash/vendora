import { supabaseServer } from "@/src/lib/supabaseServer";
import { getStorefrontProductLimit } from "./getStorefrontProductLimit";

export async function isStorefrontProductLocked(
  businessId: string,
  productId: string
): Promise<boolean> {
  const {
    productLimit,
    lockOverLimitProducts,
  } = await getStorefrontProductLimit(businessId);

  if (!lockOverLimitProducts || productLimit === null) {
    return false;
  }

  const { data: products, error } = await supabaseServer
    .from("products")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const productIndex =
    (products ?? []).findIndex(
      (product) => product.id === productId
    );

  return productIndex >= productLimit;
}
