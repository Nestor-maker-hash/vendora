import { getStorefrontProductLimit } from "./getStorefrontProductLimit";
import { getProductsByBusiness } from "@/src/features/products/services/getProductsByBusiness";

export async function getStorefrontProductAccess(
  businessId: string,
  productId: string
) {
  const [
    products,
    storefrontSettings,
  ] = await Promise.all([
    getProductsByBusiness(businessId),
    getStorefrontProductLimit(businessId),
  ]);

  const productIndex = products.findIndex(
    (product) => product.id === productId
  );

  if (productIndex === -1) {
    return {
      exists: false,
      allowed: false,
    };
  }

  const {
    productLimit,
    lockOverLimitProducts,
  } = storefrontSettings;

  const isLocked =
    lockOverLimitProducts &&
    productLimit !== null &&
    productIndex >= productLimit;

  return {
    exists: true,
    allowed: !isLocked,
  };
}
