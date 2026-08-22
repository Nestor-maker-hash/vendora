import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalMerchants() {
  const [
    businessesResult,
    productsResult,
    ordersResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabaseServer
      .from("businesses")
      .select(
        "id, owner_id, name, slug, category, phone, email, city, state, currency, store_ready_acknowledged, created_at"
      )
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("products")
      .select("id, business_id"),

    supabaseServer
      .from("orders")
      .select("id, business_id, total, status"),

   supabaseServer
  .from("business_subscriptions")
  .select(`
  id,
  business_id,
  plan_id,
  status,
  expires_at,
  subscription_plans (
    id,
    name
  )
`)

  ]);

  if (businessesResult.error) {
    throw new Error(
      `Failed to load merchants: ${businessesResult.error.message}`
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load merchant products: ${productsResult.error.message}`
    );
  }

  if (ordersResult.error) {
    throw new Error(
      `Failed to load merchant orders: ${ordersResult.error.message}`
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load merchant subscriptions: ${subscriptionsResult.error.message}`
    );
  }

  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];

  return (businessesResult.data ?? []).map((business) => {
    const merchantProducts = products.filter(
      (product) => product.business_id === business.id
    );

    const merchantOrders = orders.filter(
      (order) => order.business_id === business.id
    );

    const subscription = subscriptions.find(
      (item) => item.business_id === business.id
    );

    const revenue = merchantOrders.reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0
    );

    return {
      ...business,
      productCount: merchantProducts.length,
      orderCount: merchantOrders.length,
      revenue,
      subscription: subscription
  ? {
      status: subscription.status,
      expiresAt: subscription.expires_at,
planName: Array.isArray(
  subscription.subscription_plans
)
  ? subscription.subscription_plans[0]?.name
  : undefined,

    }
  : null,
    };
  });
}
