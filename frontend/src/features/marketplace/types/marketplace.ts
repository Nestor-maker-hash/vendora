import type { Product } from "@/src/features/products/types/product";

export interface MarketplaceBusiness {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  banner_url: string | null;
  currency: string | null;
}

export interface MarketplaceProduct extends Product {
  business: MarketplaceBusiness;
}

export interface MarketplaceData {
  businesses: MarketplaceBusiness[];
  products: MarketplaceProduct[];
}

export interface MarketplaceQuery {
  search?: string;
  category?: string;
  businessId?: string;
  excludeProductId?: string;
  limit?: number;
  offset?: number;
}
