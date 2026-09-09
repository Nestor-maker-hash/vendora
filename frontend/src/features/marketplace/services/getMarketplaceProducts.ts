import { supabaseServer } from "@/src/lib/supabaseServer";
import type {
  MarketplaceBusiness,
  MarketplaceProduct,
  MarketplaceQuery,
} from "../types/marketplace";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

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

export async function getMarketplaceProducts(
  query: MarketplaceQuery = {}
): Promise<MarketplaceProduct[]> {
  const limit = Math.min(
    Math.max(query.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim() ?? "";
  const category = query.category?.trim() ?? "";
  const businessId = query.businessId?.trim() ?? "";
  const excludeProductId = query.excludeProductId?.trim() ?? "";

  /*
   * Fast path: directly fetch related products from a specific business
   * without running through the general marketplace search pipeline.
   */
  if (businessId) {
    let relatedQuery = supabaseServer
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("business_id", businessId)
      .gt("stock", 0)
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (excludeProductId) {
      relatedQuery = relatedQuery.neq("id", excludeProductId);
    }

    const { data, error } = await relatedQuery;

    if (error) {
      throw error;
    }

    if (!data?.length) {
      return [];
    }

    const { data: business, error: businessError } =
      await supabaseServer
        .from("businesses")
        .select(BUSINESS_FIELDS)
        .eq("id", businessId)
        .eq("store_ready_acknowledged", true)
        .maybeSingle();

    if (businessError) {
      throw businessError;
    }

    if (!business) {
      return [];
    }

    return data.map((product) => ({
      ...product,
      business: business as MarketplaceBusiness,
    })) as MarketplaceProduct[];
  }

  /*
   * Marketplace visibility is controlled by the business being
   * storefront-ready. Only public business fields are selected.
   */
  let businessQuery = supabaseServer
    .from("businesses")
    .select(BUSINESS_FIELDS)
    .eq("store_ready_acknowledged", true);

  if (category) {
    businessQuery = businessQuery.eq("category", category);
  }

  /*
   * Search businesses separately so a search such as
   * "Amanda Store" can discover products belonging to that store.
   */
  if (search) {
    businessQuery = businessQuery.ilike("name", `%${search}%`);
  }

  const { data: businesses, error: businessError } =
    await businessQuery.order("created_at", {
      ascending: false,
    });

  if (businessError) {
    throw businessError;
  }

  const marketplaceBusinesses =
    (businesses ?? []) as MarketplaceBusiness[];

  /*
   * When searching, we also need products whose own fields match
   * the search term. Query those separately, then merge the
   * resulting business IDs with businesses matched by name.
   */
  let productQuery = supabaseServer
    .from("products")
    .select(PRODUCT_FIELDS)
    .gt("stock", 0);

  if (search) {
    productQuery = productQuery.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data: matchingProducts, error: matchingProductError } =
    await productQuery;

  if (matchingProductError) {
    throw matchingProductError;
  }

  const matchedBusinessIds = new Set(
    marketplaceBusinesses.map((business) => business.id)
  );

  const visibleBusinessIds = new Set(
    marketplaceBusinesses.map((business) => business.id)
  );

  const productBusinessIds = (matchingProducts ?? [])
    .map((product) => product.business_id)
    .filter((businessId) =>
      category
        ? visibleBusinessIds.has(businessId)
        : true
    );

  for (const id of productBusinessIds) {
    matchedBusinessIds.add(id);
  }

  if (matchedBusinessIds.size === 0) {
    return [];
  }

  /*
   * Re-fetch businesses using the complete set of business IDs
   * so product-name/description searches can resolve their stores.
   */
  const { data: allBusinesses, error: allBusinessError } =
    await supabaseServer
      .from("businesses")
      .select(BUSINESS_FIELDS)
      .eq("store_ready_acknowledged", true)
      .in("id", Array.from(matchedBusinessIds));

  if (allBusinessError) {
    throw allBusinessError;
  }

  const visibleBusinesses =
    (allBusinesses ?? []) as MarketplaceBusiness[];

  const businessMap = new Map(
    visibleBusinesses.map((business) => [
      business.id,
      business,
    ])
  );

  /*
   * If there is no search term, fetch the normal marketplace
   * product list. If there is a search term, use the already
   * matched product set.
   */
  let products = matchingProducts ?? [];

  if (!search) {
    const { data, error } = await supabaseServer
      .from("products")
      .select(PRODUCT_FIELDS)
      .in(
        "business_id",
        visibleBusinesses.map((business) => business.id)
      )
      .gt("stock", 0)
      .order("created_at", {
        ascending: false,
      })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    products = data ?? [];
  } else {
    products = products
      .filter((product) =>
        matchedBusinessIds.has(product.business_id)
      )
      .sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      )
      .slice(offset, offset + limit);
  }

  return products
    .map((product) => {
      const business = businessMap.get(product.business_id);

      if (!business) {
        return null;
      }

      /*
       * A product is only marketplace-visible when its business
       * is marketplace-visible. This prevents private merchant
       * products from leaking through a product search.
       */
      return {
        ...product,
        business,
      } as MarketplaceProduct;
    })
    .filter(
      (product): product is MarketplaceProduct =>
        product !== null
    );
}
