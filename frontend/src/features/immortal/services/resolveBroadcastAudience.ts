import { supabaseServer } from "@/src/lib/supabaseServer";

export interface BroadcastAudienceRules {
  subscriptionPlan?: string;
  subscriptionStatus?: "active" | "inactive";
  storeSetup?: "complete" | "incomplete";
  products?: "has_products" | "none";
  orders?: "has_orders" | "none";
  pushDevice?: "active" | "inactive";
}

export interface BroadcastAudienceMerchant {
  businessId: string;
  businessName: string;
  phone: string | null;
}

export async function resolveBroadcastAudience(
  rules: BroadcastAudienceRules
): Promise<BroadcastAudienceMerchant[]> {
  const [
    businessesResult,
    subscriptionsResult,
    productsResult,
    ordersResult,
    devicesResult,
    plansResult,
  ] = await Promise.all([
    supabaseServer
      .from("businesses")
      .select(
        "id, name, phone, store_ready_acknowledged"
      ),

    supabaseServer
      .from("business_subscriptions")
      .select(
        "business_id, plan_id, status, expires_at"
      ),

    supabaseServer
      .from("products")
      .select("business_id"),

    supabaseServer
      .from("orders")
      .select("business_id"),

    supabaseServer
      .from("push_subscriptions")
      .select("business_id, is_active"),

    supabaseServer
      .from("subscription_plans")
      .select("id, name"),
  ]);

  if (businessesResult.error) {
    throw new Error(
      `Failed to load businesses: ${businessesResult.error.message}`
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load subscriptions: ${subscriptionsResult.error.message}`
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load products: ${productsResult.error.message}`
    );
  }

  if (ordersResult.error) {
    throw new Error(
      `Failed to load orders: ${ordersResult.error.message}`
    );
  }

  if (devicesResult.error) {
    throw new Error(
      `Failed to load devices: ${devicesResult.error.message}`
    );
  }

  if (plansResult.error) {
    throw new Error(
      `Failed to load subscription plans: ${plansResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const devices = devicesResult.data ?? [];
  const plans = plansResult.data ?? [];

  const planById = new Map(
    plans.map((plan) => [plan.id, plan.name])
  );

  const productsByBusiness = new Set(
    products.map((product) => product.business_id)
  );

  const ordersByBusiness = new Set(
    orders.map((order) => order.business_id)
  );

  const activeDevicesByBusiness = new Set(
    devices
      .filter((device) => device.is_active)
      .map((device) => device.business_id)
  );

  return businesses
    .filter((business) => {
      const subscription = subscriptions.find(
        (item) =>
          item.business_id === business.id
      );

      if (rules.subscriptionPlan) {
        const planName = subscription
          ? planById.get(subscription.plan_id)
          : undefined;

        if (
          planName !== rules.subscriptionPlan
        ) {
          return false;
        }
      }

      if (rules.subscriptionStatus) {
        const active =
          subscription?.status === "active" &&
          (!subscription.expires_at ||
            new Date(subscription.expires_at) >
              new Date());

        if (
          rules.subscriptionStatus === "active" &&
          !active
        ) {
          return false;
        }

        if (
          rules.subscriptionStatus === "inactive" &&
          active
        ) {
          return false;
        }
      }

      if (rules.storeSetup) {
        const complete =
          business.store_ready_acknowledged;

        if (
          rules.storeSetup === "complete" &&
          !complete
        ) {
          return false;
        }

        if (
          rules.storeSetup === "incomplete" &&
          complete
        ) {
          return false;
        }
      }

      if (rules.products) {
        const hasProducts =
          productsByBusiness.has(
            business.id
          );

        if (
          rules.products === "has_products" &&
          !hasProducts
        ) {
          return false;
        }

        if (
          rules.products === "none" &&
          hasProducts
        ) {
          return false;
        }
      }

      if (rules.orders) {
        const hasOrders =
          ordersByBusiness.has(
            business.id
          );

        if (
          rules.orders === "has_orders" &&
          !hasOrders
        ) {
          return false;
        }

        if (
          rules.orders === "none" &&
          hasOrders
        ) {
          return false;
        }
      }

      if (rules.pushDevice) {
        const hasActiveDevice =
          activeDevicesByBusiness.has(
            business.id
          );

        if (
          rules.pushDevice === "active" &&
          !hasActiveDevice
        ) {
          return false;
        }

        if (
          rules.pushDevice === "inactive" &&
          hasActiveDevice
        ) {
          return false;
        }
      }

      return true;
    })
    .map((business) => ({
      businessId: business.id,
      businessName: business.name,
      phone: business.phone,
    }));
}
