export type MarketplaceSearchIntent =
  | "product"
  | "store"
  | "mixed";

export interface ParsedMarketplaceSearch {
  original: string;
  text: string;
  tokens: string[];
  categoryTerms: string[];
  intent: MarketplaceSearchIntent;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  storeHint?: string;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "buy",
  "can",
  "find",
  "for",
  "from",
  "give",
  "in",
  "looking",
  "me",
  "more",
  "near",
  "of",
  "on",
  "please",
  "show",
  "some",
  "that",
  "the",
  "there",
  "to",
  "want",
  "with",
  "under",
  "below",
  "less",
  "than",
  "over",
  "above",
  "between",
  "price",
  "prices",
  "cost",
  "costing",
  "around",
  "maximum",
  "minimum",
  "max",
  "min",
]);

const STORE_TERMS = new Set([
  "store",
  "stores",
  "shop",
  "shops",
  "business",
  "businesses",
  "seller",
  "sellers",
  "merchant",
  "merchants",
  "vendor",
  "vendors",
  "boutique",
  "boutiques",
]);

const PRODUCT_TERMS = new Set([
  "product",
  "products",
  "item",
  "items",
  "goods",
  "stuff",
]);

const LOCATION_PREPOSITIONS = [
  "in",
  "around",
  "near",
  "within",
];

const PRICE_CURRENCY_PATTERN = "(?:₦|ngn|naira|\\$|usd|€|eur|£|gbp)?";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s₦$€£.,'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeToken(token: string): string {
  if (token.length <= 3) return token;

  if (token.endsWith("ies")) {
    return `${token.slice(0, -3)}y`;
  }

  if (
    token.endsWith("sses") ||
    token.endsWith("shes") ||
    token.endsWith("ches") ||
    token.endsWith("xes") ||
    token.endsWith("zes")
  ) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

function addMorphologicalVariants(
  token: string
): string[] {
  const singular = singularizeToken(token);

  if (singular === token) {
    return [token];
  }

  return [token, singular];
}

function parseAmount(value: string): number | undefined {
  const normalized = value
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/₦/g, "")
    .replace(/ngn/g, "")
    .replace(/naira/g, "")
    .replace(/\$/g, "")
    .replace(/usd/g, "")
    .replace(/€/g, "")
    .replace(/eur/g, "")
    .replace(/£/g, "")
    .replace(/gbp/g, "")
    .trim();

  const match = normalized.match(
    /^(\d+(?:\.\d+)?)(k|m|b)?$/
  );

  if (!match) return undefined;

  const amount = Number(match[1]);

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  const multiplier =
    match[2] === "k"
      ? 1_000
      : match[2] === "m"
        ? 1_000_000
        : match[2] === "b"
          ? 1_000_000_000
          : 1;

  return amount * multiplier;
}

function extractPrice(query: string): {
  text: string;
  minPrice?: number;
  maxPrice?: number;
} {
  let text = query;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  const betweenMatch = text.match(
    new RegExp(
      `\\bbetween\\s+${PRICE_CURRENCY_PATTERN}\\s*([\\d,.]+(?:\\s*[kmb])?)\\s+(?:and|to)\\s+${PRICE_CURRENCY_PATTERN}\\s*([\\d,.]+(?:\\s*[kmb])?)`,
      "i"
    )
  );

  if (betweenMatch) {
    const first = parseAmount(betweenMatch[1]);
    const second = parseAmount(betweenMatch[2]);

    if (
      first !== undefined &&
      second !== undefined
    ) {
      minPrice = Math.min(first, second);
      maxPrice = Math.max(first, second);

      text = text.replace(betweenMatch[0], " ");
    }
  }

  if (
    minPrice === undefined &&
    maxPrice === undefined
  ) {
    const maxMatch = text.match(
      new RegExp(
        `\\b(?:under|below|less\\s+than|up\\s+to|max(?:imum)?(?:\\s+price)?|not\\s+more\\s+than|at\\s+most)\\s+${PRICE_CURRENCY_PATTERN}\\s*([\\d,.]+(?:\\s*[kmb])?)`,
        "i"
      )
    );

    if (maxMatch) {
      const amount = parseAmount(maxMatch[1]);

      if (amount !== undefined) {
        maxPrice = amount;
        text = text.replace(
          maxMatch[0],
          " "
        );
      }
    }

    const minMatch = text.match(
      new RegExp(
        `\\b(?:over|above|more\\s+than|at\\s+least|starting\\s+from|from)\\s+${PRICE_CURRENCY_PATTERN}\\s*([\\d,.]+(?:\\s*[kmb])?)`,
        "i"
      )
    );

    if (minMatch) {
      const amount = parseAmount(minMatch[1]);

      if (amount !== undefined) {
        minPrice = amount;
        text = text.replace(
          minMatch[0],
          " "
        );
      }
    }
  }

  return {
    text: text.replace(/\s+/g, " ").trim(),
    minPrice,
    maxPrice,
  };
}

function extractLocation(query: string): {
  text: string;
  location?: string;
} {
  /*
   * Prefer locations at the end of the query:
   *
   * "shoes in Abuja"
   * "fashion stores around Lagos"
   *
   * Then handle locations followed by another recognizable
   * search constraint.
   */
  const endPattern =
    /\b(?:in|around|near|within)\s+([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]{1,50})$/i;

  const endMatch = query.match(endPattern);

  if (endMatch) {
    const location = endMatch[1]
      .replace(/\s+/g, " ")
      .trim();

    if (location.length >= 2) {
      return {
        text: query
          .replace(endMatch[0], " ")
          .replace(/\s+/g, " ")
          .trim(),
        location,
      };
    }
  }

  const constrainedPattern =
    /\b(?:in|around|near|within)\s+([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]{1,50}?)(?=\s+(?:under|below|above|over|between|with|for|from|at\s+most|at\s+least|less|more)\b)/i;

  const constrainedMatch =
    query.match(constrainedPattern);

  if (constrainedMatch) {
    const location = constrainedMatch[1]
      .replace(/\s+/g, " ")
      .trim();

    if (location.length >= 2) {
      return {
        text: query
          .replace(constrainedMatch[0], " ")
          .replace(/\s+/g, " ")
          .trim(),
        location,
      };
    }
  }

  return { text: query };
}

function extractStoreHint(query: string): {
  text: string;
  storeHint?: string;
} {
  const patterns = [
    /*
     * "products from Amanda"
     * "shoes from Amanda"
     * "phones at Amanda"
     * "black dresses from Amanda"
     *
     * The final phrase after "from/at" is treated as the
     * store hint when it is not itself a generic store phrase.
     */
    /\b(?:products?|items?|goods?)\s+(?:from|at)\s+(.+)$/i,

    /*
     * Arbitrary product wording followed by a store name:
     * "shoes from Amanda"
     * "black dresses at Amanda"
     *
     * Keep generic phrases such as "from stores" out of this
     * rule because those describe a store category rather than
     * a specific store.
     */
    /\b(?:from|at)\s+(.+?)$/i,

    /*
     * "from Amanda store"
     * "at Amanda shop"
     */
    /\b(?:from|at)\s+(?:the\s+)?(.+?)\s+(?:store|shop|business|seller|merchant|vendor)\b/i,

    /*
     * "from the store Amanda"
     */
    /\b(?:from|at)\s+(?:the\s+)?(?:store|shop|business|seller|merchant|vendor)\s+(.+)$/i,

    /*
     * "store Amanda"
     * "shop Amanda"
     */
    /\b(?:store|shop|business|seller|merchant|vendor)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);

    if (!match) continue;

    const storeHint = match[1]
      .replace(/\s+/g, " ")
      .trim();

    const normalizedHint = normalize(storeHint);

    const genericStoreHint =
      STORE_TERMS.has(normalizedHint) ||
      normalizedHint.startsWith("store ") ||
      normalizedHint.startsWith("shop ") ||
      normalizedHint.startsWith("business ") ||
      normalizedHint.startsWith("seller ") ||
      normalizedHint.startsWith("merchant ") ||
      normalizedHint.startsWith("vendor ");

    if (
      storeHint.length >= 2 &&
      !genericStoreHint
    ) {
      return {
        text: query
          .replace(match[0], " ")
          .replace(/\s+/g, " ")
          .trim(),
        storeHint,
      };
    }
  }

  return { text: query };
}

function removeGenericStorePhrase(text: string): string {
  return text
    .replace(
      /\b(?:from|at)\s+(?:the\s+)?(?:stores?|shops?|businesses?|sellers?|merchants?|vendors?)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(text: string): string[] {
  const rawTokens = text
    .split(/\s+/)
    .filter(Boolean);

  return Array.from(
    new Set(
      rawTokens
        .flatMap(addMorphologicalVariants)
        .filter(
          (token) =>
            token.length >= 2 &&
            !STOP_WORDS.has(token) &&
            !STORE_TERMS.has(token) &&
            !PRODUCT_TERMS.has(token)
        )
    )
  );
}

const CATEGORY_TERMS = new Set([
  "shoe",
  "shoes",
  "footwear",
  "sneaker",
  "sneakers",
  "boot",
  "boots",
  "sandal",
  "sandals",

  "cloth",
  "clothes",
  "clothing",
  "apparel",
  "fashion",
  "shirt",
  "shirts",
  "tshirt",
  "tshirts",
  "hoodie",
  "hoodies",
  "jacket",
  "jackets",
  "trouser",
  "trousers",
  "jeans",
  "dress",
  "dresses",
  "skirt",
  "skirts",

  "phone",
  "phones",
  "smartphone",
  "smartphones",
  "mobile",
  "tablet",
  "tablets",
  "laptop",
  "laptops",
  "computer",
  "computers",

  "beauty",
  "cosmetic",
  "cosmetics",
  "skincare",
  "makeup",
  "perfume",
  "perfumes",

  "food",
  "foods",
  "grocery",
  "groceries",

  "bag",
  "bags",
  "backpack",
  "backpacks",
  "watch",
  "watches",
  "jewelry",
  "jewellery",
]);

function extractSemanticTerms(
  tokens: string[]
): { categoryTerms: string[] } {
  const categoryTerms = Array.from(
    new Set(
      tokens.filter((token) =>
        CATEGORY_TERMS.has(token)
      )
    )
  );

  return { categoryTerms };
}

function detectIntent(
  query: string,
  storeHint?: string
): MarketplaceSearchIntent {
  if (storeHint) {
    return "product";
  }

  const tokens = query
    .split(/\s+/)
    .filter(Boolean);

  const hasStoreTerm = tokens.some((token) =>
    STORE_TERMS.has(token)
  );

  const hasProductTerm = tokens.some((token) =>
    PRODUCT_TERMS.has(token)
  );

  if (
    hasStoreTerm &&
    hasProductTerm
  ) {
    return "mixed";
  }

  if (hasStoreTerm) {
    return "store";
  }

  /*
   * In Vendora, a bare search such as "shoes", "phones",
   * "laptops" or "black hoodie" should default to products.
   */
  return "product";
}

export function parseMarketplaceSearch(
  search: string
): ParsedMarketplaceSearch {
  const original = search.trim();

  if (!original) {
    return {
      original: "",
      text: "",
      tokens: [],
      categoryTerms: [],
      intent: "mixed",
    };
  }

  let text = normalize(original);

  /*
   * Extract structured constraints before tokenization.
   * This prevents words such as "under", "in" or "from"
   * from polluting relevance scoring.
   */
  const priceResult = extractPrice(text);
  text = priceResult.text;

  const locationResult = extractLocation(text);
  text = locationResult.text;

  const storeResult = extractStoreHint(text);
  text = storeResult.text;

  /*
   * Generic phrases such as "bags from stores" do not identify
   * a particular store. Remove the connector phrase so "stores"
   * cannot incorrectly force store intent.
   *
   * Specific hints such as "bags from Amanda" have already been
   * extracted above and are therefore unaffected.
   */
  text = removeGenericStorePhrase(text);

  const tokens = getTokens(text);
  const semanticTerms = extractSemanticTerms(tokens);

  return {
    original,
    text,
    tokens,
    ...semanticTerms,
    intent: detectIntent(
      text,
      storeResult.storeHint
    ),
    minPrice: priceResult.minPrice,
    maxPrice: priceResult.maxPrice,
    location: locationResult.location,
    storeHint: storeResult.storeHint,
  };
}
