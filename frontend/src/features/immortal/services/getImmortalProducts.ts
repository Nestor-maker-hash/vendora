import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalProducts() {
  const [
    productsResult,
    businessesResult,
  ] = await Promise.all([
    supabaseServer
      .from("products")
      .select(
        "id, business_id, name, description, price, stock, minimum_order_quantity, image_url, created_at"
      )
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("businesses")
      .select("id, name, slug, currency"),
  ]);

  if (productsResult.error) {
    throw new Error(
      `Failed to load platform products: ${productsResult.error.message}`
    );
  }

  if (businessesResult.error) {
    throw new Error(
      `Failed to load product merchants: ${businessesResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const businessMap = new Map(
    businesses.map((business) => [
      business.id,
      business,
    ])
  );

  return (productsResult.data ?? []).map((product) => ({
    ...product,
    business: businessMap.get(product.business_id) ?? null,
  }));
}
