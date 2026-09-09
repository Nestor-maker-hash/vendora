import { supabaseServer } from "@/src/lib/supabaseServer";
import type {
  MarketplaceBusiness,
  MarketplaceProduct,
} from "../types/marketplace";

const BUSINESS_FIELDS = `
  id,
  name,
  slug,
  category,
  description,
  city,
  state,
  logo_url,
  banner_url,
  currency
`;

const PRODUCT_FIELDS = `
  id,
  business_id,
  name,
  description,
  price,
  stock,
  minimum_order_quantity,
  image_url,
  created_at
`;

export async function getMarketplaceProduct(
  productId: string
): Promise<MarketplaceProduct | null> {
  const { data: product, error: productError } =
    await supabaseServer
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("id", productId)
      .gt("stock", 0)
      .maybeSingle();

  if (productError) {
    throw productError;
  }

  if (!product) {
    return null;
  }

  const { data: business, error: businessError } =
    await supabaseServer
      .from("businesses")
      .select(BUSINESS_FIELDS)
      .eq("id", product.business_id)
      .eq("store_ready_acknowledged", true)
      .maybeSingle();

  if (businessError) {
    throw businessError;
  }

  if (!business) {
    return null;
  }

  return {
    ...product,
    business: business as MarketplaceBusiness,
  } as MarketplaceProduct;
}
