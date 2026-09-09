import { supabaseServer } from "@/src/lib/supabaseServer";
import {
  MarketplaceBusiness,
  MarketplaceData,
  MarketplaceProduct,
} from "../types/marketplace";

const BUSINESS_FIELDS = `
  id,
  name,
  slug,
  category,
  description,
  address,
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

export async function getMarketplace(): Promise<MarketplaceData> {
  const { data: businesses, error: businessError } =
    await supabaseServer
      .from("businesses")
      .select(BUSINESS_FIELDS)
      .eq("store_ready_acknowledged", true)
      .order("created_at", {
        ascending: false,
      });

  if (businessError) {
    throw businessError;
  }

  const marketplaceBusinesses =
    (businesses ?? []) as MarketplaceBusiness[];

  if (marketplaceBusinesses.length === 0) {
    return {
      businesses: [],
      products: [],
    };
  }

  const businessIds = marketplaceBusinesses.map(
    (business) => business.id
  );

  const businessMap = new Map(
    marketplaceBusinesses.map((business) => [
      business.id,
      business,
    ])
  );

  const { data: products, error: productError } =
    await supabaseServer
      .from("products")
      .select(PRODUCT_FIELDS)
      .in("business_id", businessIds)
      .gt("stock", 0)
      .order("created_at", {
        ascending: false,
      });

  if (productError) {
    throw productError;
  }

  const marketplaceProducts: MarketplaceProduct[] =
    (products ?? [])
      .map((product) => {
        const business = businessMap.get(
          product.business_id
        );

        if (!business) {
          return null;
        }

        return {
          ...product,
          business,
        };
      })
      .filter(
        (product): product is MarketplaceProduct =>
          product !== null
      );

  return {
    businesses: marketplaceBusinesses,
    products: marketplaceProducts,
  };
}
