import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalOverview() {
  const [
    businessesResult,
    ordersResult,
    productsResult,
    subscriptionsResult,
    notificationsResult,
    pushSubscriptionsResult,
  ] = await Promise.all([
    supabaseServer
      .from("businesses")
      .select("id, name, created_at"),

    supabaseServer
      .from("orders")
      .select(
        "id, business_id, customer_name, customer_phone, total, status, payment_status, created_at"
      ),

    supabaseServer
      .from("products")
      .select("id, business_id, name, stock, price"),

    supabaseServer
      .from("business_subscriptions")
      .select(
        "id, business_id, plan_id, status, created_at, expires_at"
      ),

    supabaseServer
      .from("notifications")
      .select("id, business_id, is_read, created_at"),

    supabaseServer
      .from("push_subscriptions")
      .select(
        "id, business_id, platform, is_active, last_used_at"
      ),
  ]);

  if (businessesResult.error) {
    throw new Error(
      `Failed to load businesses: ${businessesResult.error.message}`
    );
  }

  if (ordersResult.error) {
    throw new Error(
      `Failed to load orders: ${ordersResult.error.message}`
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load products: ${productsResult.error.message}`
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load subscriptions: ${subscriptionsResult.error.message}`
    );
  }

  if (notificationsResult.error) {
    throw new Error(
      `Failed to load notifications: ${notificationsResult.error.message}`
    );
  }

  if (pushSubscriptionsResult.error) {
    throw new Error(
      `Failed to load push subscriptions: ${pushSubscriptionsResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const notifications = notificationsResult.data ?? [];
  const pushSubscriptions =
    pushSubscriptionsResult.data ?? [];

  const customerPhones = new Set(
    orders
      .map((order) => order.customer_phone)
      .filter(Boolean)
  );

  const grossOrderValue = orders.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const paidOrderValue = orders.reduce(
    (sum, order) => {
      if (order.payment_status === "paid") {
        return sum + Number(order.total ?? 0);
      }

      return sum;
    },
    0
  );

  const pendingOrderValue = orders.reduce(
    (sum, order) => {
      if (
        order.status !== "cancelled" &&
        order.payment_status !== "paid"
      ) {
        return sum + Number(order.total ?? 0);
      }

      return sum;
    },
    0
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const failedPayments = orders.filter(
    (order) => order.payment_status === "failed"
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.payment_status === "pending"
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const activeSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.status === "active"
  ).length;

  const activePushDevices = pushSubscriptions.filter(
    (subscription) => subscription.is_active
  ).length;

  const inactivePushDevices = pushSubscriptions.filter(
    (subscription) => !subscription.is_active
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      typeof product.stock === "number" &&
      product.stock <= 5
  ).length;

  const merchantsWithProducts = new Set(
    products.map((product) => product.business_id)
  );

  const merchantsWithOrders = new Set(
    orders.map((order) => order.business_id)
  );

  const merchantsNeedingSetup = businesses.filter(
    (business) =>
      !merchantsWithProducts.has(business.id) ||
      !merchantsWithOrders.has(business.id)
  ).length;

  return {
    merchants: businesses.length,
    orders: orders.length,
    products: products.length,
    customers: customerPhones.size,

    grossOrderValue,
    paidOrderValue,
    pendingOrderValue,

    pendingOrders,
    cancelledOrders,
    failedPayments,

    activeSubscriptions,

    unreadNotifications,

    activePushDevices,
    inactivePushDevices,

    lowStockProducts,

    merchantsNeedingSetup,
  };
}
