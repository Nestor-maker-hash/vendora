import { supabaseServer } from "@/src/lib/supabaseServer";
import {
  parseMarketplaceSearch,
  type ParsedMarketplaceSearch,
} from "./parseMarketplaceSearch";
import type {
  MarketplaceBusiness,
  MarketplaceProduct,
} from "../types/marketplace";

const PRODUCT_CANDIDATE_LIMIT = 100;
const BUSINESS_CANDIDATE_LIMIT = 60;

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

const SEARCH_ALIASES: Record<string, string[]> = {
  shoe: ["shoes", "footwear", "sneaker", "sneakers"],
  shoes: ["shoe", "footwear", "sneaker", "sneakers"],
  footwear: ["shoe", "shoes", "sneaker", "sneakers"],
  sneaker: ["shoe", "shoes", "footwear", "sneakers"],
  sneakers: ["shoe", "shoes", "footwear", "sneaker"],

  cloth: ["clothes", "clothing", "apparel", "fashion"],
  clothes: ["cloth", "clothing", "apparel", "fashion"],
  clothing: ["cloth", "clothes", "apparel", "fashion"],
  apparel: ["cloth", "clothes", "clothing", "fashion"],
  fashion: ["cloth", "clothes", "clothing", "apparel"],

  phone: ["phones", "smartphone", "smartphones", "mobile"],
  phones: ["phone", "smartphone", "smartphones", "mobile"],
  smartphone: ["phone", "phones", "smartphones", "mobile"],
  smartphones: ["phone", "phones", "smartphone", "mobile"],

  laptop: ["laptops", "computer", "computers"],
  laptops: ["laptop", "computer", "computers"],
  computer: ["computers", "laptop", "laptops"],
  computers: ["computer", "laptop", "laptops"],

  beauty: ["cosmetics", "cosmetic"],
  cosmetics: ["beauty", "cosmetic"],
  cosmetic: ["beauty", "cosmetics"],

  food: ["foods", "groceries", "grocery"],
  foods: ["food", "groceries", "grocery"],
  grocery: ["groceries", "food"],
  groceries: ["grocery", "food"],

  bag: ["bags", "backpack", "backpacks"],
  bags: ["bag", "backpack", "backpacks"],
  backpack: ["bag", "bags", "backpacks"],
  backpacks: ["bag", "bags", "backpack"],

  watch: ["watches"],
  watches: ["watch"],

  jewelry: ["jewellery", "jewelry"],
  jewellery: ["jewelry"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandTerms(tokens: string[]): string[] {
  return Array.from(
    new Set(
      tokens.flatMap((token) => [
        token,
        ...(SEARCH_ALIASES[token] ?? []),
      ])
    )
  );
}

function escapeLike(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}function buildPatterns(
  field: string,
  terms: string[]
): string[] {
  return terms.map(
    (term) => `${field}.ilike.%${escapeLike(term)}%`
  );
}

function businessText(
  business: MarketplaceBusiness
): string {
  return normalize(
    [
      business.name,
      business.category,
      business.description,
      business.city,
      business.state,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function productText(
  product: MarketplaceProduct
): string {
  return normalize(
    [
      product.name,
      product.description,
      product.business.name,
      product.business.category,
      product.business.description,
      product.business.city,
      product.business.state,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function locationMatches(
  business: MarketplaceBusiness,
  location?: string
): boolean {
  if (!location) return true;

  const target = normalize(location);

  return [
    business.city,
    business.state,
  ]
    .filter(Boolean)
    .some((value) => {
      const normalized = normalize(value ?? "");
      return (
        normalized === target ||
        normalized.includes(target) ||
        target.includes(normalized)
      );
    });
}

function priceMatches(
  product: MarketplaceProduct,
  parsed: ParsedMarketplaceSearch
): boolean {
  if (
    parsed.minPrice !== undefined &&
    product.price < parsed.minPrice
  ) {
    return false;
  }

  if (
    parsed.maxPrice !== undefined &&
    product.price > parsed.maxPrice
  ) {
    return false;
  }

  return true;
}

function scoreBusiness(
  business: MarketplaceBusiness,
  parsed: ParsedMarketplaceSearch,
  expandedTerms: string[]
): number {
  const name = normalize(business.name);
  const category = normalize(business.category ?? "");
  const description = normalize(business.description ?? "");
  const city = normalize(business.city ?? "");
  const state = normalize(business.state ?? "");
  const query = parsed.text;
  const searchable = businessText(business);

  let score = 0;

  /*
   * Store-name hints are the strongest business signal.
   *
   * Example:
   * "products from Amanda"
   */
  if (parsed.storeHint) {
    const hint = normalize(parsed.storeHint);

    if (name === hint) score += 400;
    else if (name.includes(hint)) score += 280;
    else if (hint.includes(name)) score += 160;
  }

  /*
   * An exact remaining query is also highly relevant.
   */
  if (query) {
    if (name === query) score += 220;
    else if (name.includes(query)) score += 130;
  }

  /*
   * Category terms are much stronger than ordinary text matches.
   *
   * Example:
   * "shoe stores"
   *
   * A store whose category is "Footwear" should be considered
   * highly relevant once the parser identifies "shoe" as a
   * category term.
   */
  for (const categoryTerm of parsed.categoryTerms) {
    if (category === categoryTerm) score += 150;
    else if (category.includes(categoryTerm)) score += 100;

    if (name === categoryTerm) score += 90;
    else if (name.includes(categoryTerm)) score += 65;

    if (description.includes(categoryTerm)) score += 35;
  }

  /*
   * Ordinary query tokens still matter.
   */
  for (const token of parsed.tokens) {
    if (name === token) score += 110;
    else if (name.includes(token)) score += 70;

    if (category === token) score += 80;
    else if (category.includes(token)) score += 45;

    if (city === token || state === token) score += 75;
    else if (
      city.includes(token) ||
      state.includes(token)
    ) {
      score += 45;
    }

    if (description.includes(token)) score += 25;
  }

  /*
   * Expanded aliases provide recall without overpowering direct
   * matches.
   */
  for (const term of expandedTerms) {
    if (
      !parsed.tokens.includes(term) &&
      searchable.includes(term)
    ) {
      score += parsed.categoryTerms.includes(term)
        ? 24
        : 12;
    }
  }

  /*
   * Location is a hard filter elsewhere, so this is only a
   * relevance bonus.
   */
  if (
    parsed.location &&
    locationMatches(business, parsed.location)
  ) {
    score += 100;
  }

  /*
   * Explicit store intent should favor businesses.
   */
  if (parsed.intent === "store") {
    score += 70;
  } else if (parsed.intent === "mixed") {
    score += 25;
  }

  return score;
}

function scoreProduct(
  product: MarketplaceProduct,
  parsed: ParsedMarketplaceSearch,
  expandedTerms: string[]
): number {
  const name = normalize(product.name);
  const description = normalize(product.description ?? "");
  const storeName = normalize(product.business.name);
  const category = normalize(product.business.category ?? "");
  const businessDescription = normalize(
    product.business.description ?? ""
  );
  const city = normalize(product.business.city ?? "");
  const state = normalize(product.business.state ?? "");
  const query = parsed.text;
  const searchable = productText(product);

  let score = 0;

  /*
   * Exact product/store query matches are the strongest signals.
   */
  if (query) {
    if (name === query) score += 300;
    else if (name.includes(query)) score += 170;

    if (storeName === query) score += 230;
    else if (storeName.includes(query)) score += 110;
  }

  /*
   * Explicit store hints should strongly favor products from that
   * store.
   */
  if (parsed.storeHint) {
    const hint = normalize(parsed.storeHint);

    if (storeName === hint) score += 360;
    else if (storeName.includes(hint)) score += 260;
    else if (hint.includes(storeName)) score += 140;
  }

  let matchedTokens = 0;
  let matchedCategoryTerms = 0;

  /*
   * Category terms represent what the user is actually looking
   * for, so category relevance gets a stronger signal.
   */
  for (const categoryTerm of parsed.categoryTerms) {
    let matched = false;

    if (name === categoryTerm) {
      score += 150;
      matched = true;
    } else if (name.includes(categoryTerm)) {
      score += 95;
      matched = true;
    }

    if (category === categoryTerm) {
      score += 130;
      matched = true;
    } else if (category.includes(categoryTerm)) {
      score += 80;
      matched = true;
    }

    if (description.includes(categoryTerm)) {
      score += 45;
      matched = true;
    }

    if (businessDescription.includes(categoryTerm)) {
      score += 30;
      matched = true;
    }

    if (matched) {
      matchedCategoryTerms += 1;
    }
  }

  /*
   * General token matching.
   */
  for (const token of parsed.tokens) {
    let matched = false;

    if (name === token) {
      score += 125;
      matched = true;
    } else if (name.includes(token)) {
      score += 75;
      matched = true;
    }

    if (category === token) {
      score += 95;
      matched = true;
    } else if (category.includes(token)) {
      score += 55;
      matched = true;
    }

    if (storeName === token) {
      score += 105;
      matched = true;
    } else if (storeName.includes(token)) {
      score += 60;
      matched = true;
    }

    if (description.includes(token)) {
      score += 35;
      matched = true;
    }

    if (businessDescription.includes(token)) {
      score += 20;
      matched = true;
    }

    if (
      city === token ||
      state === token
    ) {
      score += 65;
      matched = true;
    } else if (
      city.includes(token) ||
      state.includes(token)
    ) {
      score += 35;
      matched = true;
    }

    if (matched) {
      matchedTokens += 1;
    }
  }

  /*
   * Multi-term queries should reward products satisfying several
   * parts of the query rather than just one.
   */
  if (
    parsed.tokens.length > 1 &&
    matchedTokens > 1
  ) {
    score += matchedTokens * 45;
  }

  if (
    parsed.categoryTerms.length > 1 &&
    matchedCategoryTerms > 1
  ) {
    score += matchedCategoryTerms * 35;
  }

  /*
   * Alias matches improve recall but remain weaker than direct
   * matches.
   */
  for (const term of expandedTerms) {
    if (
      !parsed.tokens.includes(term) &&
      searchable.includes(term)
    ) {
      score += parsed.categoryTerms.includes(term)
        ? 22
        : 14;
    }
  }

  if (
    parsed.location &&
    locationMatches(product.business, parsed.location)
  ) {
    score += 100;
  }

  /*
   * Price constraints are already hard filters. These small
   * bonuses simply acknowledge that the product satisfies the
   * user's explicit constraint.
   */
  if (parsed.minPrice !== undefined) {
    score += 15;
  }

  if (parsed.maxPrice !== undefined) {
    score += 15;
  }

  if (product.stock > 0) {
    score += 5;
  }

  /*
   * Slight freshness preference for otherwise similarly relevant
   * products.
   */
  const createdAt = Date.parse(product.created_at);

  if (!Number.isNaN(createdAt)) {
    const ageDays =
      (Date.now() - createdAt) /
      (1000 * 60 * 60 * 24);

    if (ageDays <= 7) score += 8;
    else if (ageDays <= 30) score += 4;
  }

  /*
   * Explicit store intent should not make products disappear;
   * it simply shifts the result balance toward businesses.
   */
  if (parsed.intent === "mixed") {
    score += 15;
  }

  return score;
}

export interface MarketplaceSearchResult {
  products: MarketplaceProduct[];
  businesses: MarketplaceBusiness[];
}

export async function searchMarketplace(
  search: string
): Promise<MarketplaceSearchResult> {
  const parsed = parseMarketplaceSearch(search);

  if (!parsed.original) {
    return {
      products: [],
      businesses: [],
    };
  }

  const expandedTerms = expandTerms(parsed.tokens);

  const productMap = new Map<
    string,
    Record<string, unknown>
  >();

  const businessMap = new Map<
    string,
    MarketplaceBusiness
  >();/*
   * 1. Direct business candidates.
   *
   * Store names, categories, descriptions and locations can
   * independently introduce a business into the candidate set.
   */
  const businessQueries = [];

  if (expandedTerms.length > 0) {
    businessQueries.push(
      supabaseServer
        .from("businesses")
        .select(BUSINESS_FIELDS)
        .eq("store_ready_acknowledged", true)
        .or(
          [
            ...buildPatterns("name", expandedTerms),
            ...buildPatterns("category", expandedTerms),
            ...buildPatterns("description", expandedTerms),
            ...expandedTerms.flatMap((term) => [
              `city.ilike.%${escapeLike(term)}%`,
              `state.ilike.%${escapeLike(term)}%`,
            ]),
          ].join(",")
        )
        .limit(BUSINESS_CANDIDATE_LIMIT)
    );
  }

  /*
   * A store hint is a stronger signal than generic terms, so
   * query it directly as well.
   */
  if (parsed.storeHint) {
    const hint = escapeLike(normalize(parsed.storeHint));

    businessQueries.push(
      supabaseServer
        .from("businesses")
        .select(BUSINESS_FIELDS)
        .eq("store_ready_acknowledged", true)
        .ilike("name", `%${hint}%`)
        .limit(BUSINESS_CANDIDATE_LIMIT)
    );
  }

  /*
   * Location-only searches need a direct location query even when
   * there are no remaining product tokens.
   */
  if (parsed.location) {
    const location = escapeLike(normalize(parsed.location));

    businessQueries.push(
      supabaseServer
        .from("businesses")
        .select(BUSINESS_FIELDS)
        .eq("store_ready_acknowledged", true)
        .or(
          `city.ilike.%${location}%,state.ilike.%${location}%`
        )
        .limit(BUSINESS_CANDIDATE_LIMIT)
    );
  }

  const businessResults =
    await Promise.all(businessQueries);

  for (const result of businessResults) {
    if (result.error) throw result.error;

    for (const business of result.data ?? []) {
      businessMap.set(
        business.id,
        business as MarketplaceBusiness
      );
    }
  }

  /*
   * 2. Direct product candidates.
   *
   * Search product fields separately from business fields so a
   * product can be found even when its store itself doesn't match
   * the query.
   */
  if (expandedTerms.length > 0) {
    const [nameResult, descriptionResult] =
      await Promise.all([
        supabaseServer
          .from("products")
          .select(PRODUCT_FIELDS)
          .gt("stock", 0)
          .or(buildPatterns("name", expandedTerms).join(","))
          .order("created_at", { ascending: false })
          .limit(PRODUCT_CANDIDATE_LIMIT),

        supabaseServer
          .from("products")
          .select(PRODUCT_FIELDS)
          .gt("stock", 0)
          .or(
            buildPatterns(
              "description",
              expandedTerms
            ).join(",")
          )
          .order("created_at", { ascending: false })
          .limit(PRODUCT_CANDIDATE_LIMIT),
      ]);

    if (nameResult.error) throw nameResult.error;
    if (descriptionResult.error) {
      throw descriptionResult.error;
    }

    for (const product of nameResult.data ?? []) {
      productMap.set(product.id, product);
    }

    for (const product of descriptionResult.data ?? []) {
      productMap.set(product.id, product);
    }
  }

  /*
   * 3. Products belonging to explicitly matched stores.
   *
   * This is what makes queries such as "products from Amanda"
   * work even when "Amanda" never appears in the product name.
   */
  const matchedBusinessIds = Array.from(
    businessMap.keys()
  );

  if (matchedBusinessIds.length > 0) {
    const { data, error } = await supabaseServer
      .from("products")
      .select(PRODUCT_FIELDS)
      .in("business_id", matchedBusinessIds)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(PRODUCT_CANDIDATE_LIMIT);

    if (error) throw error;

    for (const product of data ?? []) {
      productMap.set(product.id, product);
    }
  }

  /*
   * 4. Resolve businesses belonging to products that matched
   * independently.
   */
  const productBusinessIds = Array.from(
    new Set(
      Array.from(productMap.values())
        .map((product) => product.business_id as string)
        .filter(Boolean)
    )
  );

  const unresolvedBusinessIds =
    productBusinessIds.filter(
      (id) => !businessMap.has(id)
    );

  if (unresolvedBusinessIds.length > 0) {
    const { data, error } = await supabaseServer
      .from("businesses")
      .select(BUSINESS_FIELDS)
      .eq("store_ready_acknowledged", true)
      .in("id", unresolvedBusinessIds);

    if (error) throw error;

    for (const business of data ?? []) {
      businessMap.set(
        business.id,
        business as MarketplaceBusiness
      );
    }
  }

  /*
   * 5. Build complete product objects and apply hard constraints.
   */
  const products = Array.from(productMap.values())
    .map((product) => {
      const business = businessMap.get(
        product.business_id as string
      );

      if (!business) return null;

      const marketplaceProduct = {
        ...product,
        business,
      } as MarketplaceProduct;

      if (
        parsed.location &&
        !locationMatches(
          marketplaceProduct.business,
          parsed.location
        )
      ) {
        return null;
      }

      if (!priceMatches(marketplaceProduct, parsed)) {
        return null;
      }

      return marketplaceProduct;
    })
    .filter(
      (product): product is MarketplaceProduct =>
        product !== null
    )
    .map((product) => ({
      product,
      score: scoreProduct(
        product,
        parsed,
        expandedTerms
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.product.created_at.localeCompare(
        a.product.created_at
      );
    })
    .slice(0, 24)
    .map((item) => item.product);

  /*
   * 6. Rank stores independently.
   *
   * Stores discovered through matching products are deliberately
   * included. This allows "stores selling shoes" to surface the
   * stores that actually have matching shoes.
   */
  const productMatchedBusinessIds = new Set(
    products.map((product) => product.business_id)
  );

  const businesses = Array.from(
    businessMap.values()
  )
    .filter((business) => {
      if (
        parsed.location &&
        !locationMatches(business, parsed.location)
      ) {
        return false;
      }

      if (
        parsed.intent === "store" ||
        parsed.intent === "mixed"
      ) {
        return true;
      }

      if (parsed.storeHint) {
        return true;
      }

      return productMatchedBusinessIds.has(business.id);
    })
    .map((business) => ({
      business,
      score:
        scoreBusiness(
          business,
          parsed,
          expandedTerms
        ) +
        (productMatchedBusinessIds.has(business.id)
          ? 45
          : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => item.business);

  return {
    products,
    businesses,
  };
}
