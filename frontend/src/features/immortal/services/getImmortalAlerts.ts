import { supabaseServer } from "@/src/lib/supabaseServer";

export type ImmortalAlertSeverity =
  | "critical"
  | "warning"
  | "system";

export interface ImmortalAlert {
  id: string;
  severity: ImmortalAlertSeverity;
  title: string;
  description: string;
  count: number;
  href: string;
}

export async function getImmortalAlerts(): Promise<
  ImmortalAlert[]
> {
  const [
    businessesResult,
    ordersResult,
    productsResult,
    subscriptionsResult,
    pushSubscriptionsResult,
  ] = await Promise.all([
    supabaseServer
      .from("businesses")
      .select(
        "id, store_ready_acknowledged"
      ),

    supabaseServer
      .from("orders")
      .select(
        "id, business_id, status, payment_status"
      ),

    supabaseServer
      .from("products")
      .select(
        "id, business_id, stock"
      ),

    supabaseServer
      .from("business_subscriptions")
      .select(
        "id, business_id, status, expires_at"
      ),

    supabaseServer
      .from("push_subscriptions")
      .select(
        "id, business_id, is_active"
      ),
  ]);

  if (businessesResult.error) {
    throw new Error(
      `Failed to load alert businesses: ${businessesResult.error.message}`
    );
  }

  if (ordersResult.error) {
    throw new Error(
      `Failed to load alert orders: ${ordersResult.error.message}`
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load alert products: ${productsResult.error.message}`
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Failed to load alert subscriptions: ${subscriptionsResult.error.message}`
    );
  }

  if (pushSubscriptionsResult.error) {
    throw new Error(
      `Failed to load alert devices: ${pushSubscriptionsResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];
  const subscriptions =
    subscriptionsResult.data ?? [];
  const devices =
    pushSubscriptionsResult.data ?? [];

  const alerts: ImmortalAlert[] = [];

  const failedPayments = orders.filter(
    (order) =>
      order.payment_status === "failed"
  ).length;

  if (failedPayments > 0) {
    alerts.push({
      id: "failed-payments",
      severity: "critical",
      title: "Failed payments detected",
      description:
        "Orders have payment failures that may require investigation.",
      count: failedPayments,
      href: "/immortal/orders",
    });
  }

  const now = new Date();

  const expiredSubscriptions =
    subscriptions.filter((subscription) => {
      if (!subscription.expires_at) {
        return false;
      }

      return (
        subscription.status !== "active" ||
        new Date(subscription.expires_at) < now
      );
    }).length;

  if (expiredSubscriptions > 0) {
    alerts.push({
      id: "expired-subscriptions",
      severity: "critical",
      title: "Subscription problems detected",
      description:
        "Merchant subscriptions are inactive or past their expiry date.",
      count: expiredSubscriptions,
      href: "/immortal/subscriptions",
    });
  }

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.payment_status === "pending"
  ).length;

  if (pendingOrders > 0) {
    alerts.push({
      id: "pending-orders",
      severity: "warning",
      title: "Pending orders",
      description:
        "Orders are waiting for payment or fulfillment.",
      count: pendingOrders,
      href: "/immortal/orders",
    });
  }

  const lowStockProducts = products.filter(
    (product) =>
      typeof product.stock === "number" &&
      product.stock <= 5
  ).length;

  if (lowStockProducts > 0) {
    alerts.push({
      id: "low-stock",
      severity: "warning",
      title: "Low-stock products",
      description:
        "Products are at or below the platform low-stock threshold.",
      count: lowStockProducts,
      href: "/immortal/products",
    });
  }

  const merchantsWithProducts =
    new Set(
      products.map(
        (product) => product.business_id
      )
    );

  const merchantsWithOrders =
    new Set(
      orders.map(
        (order) => order.business_id
      )
    );

  const merchantsNeedingSetup =
    businesses.filter(
      (business) =>
        !business.store_ready_acknowledged ||
        !merchantsWithProducts.has(
          business.id
        ) ||
        !merchantsWithOrders.has(
          business.id
        )
    ).length;

  if (merchantsNeedingSetup > 0) {
    alerts.push({
      id: "merchant-setup",
      severity: "warning",
      title: "Merchants still setting up",
      description:
        "Some merchants have not completed their store setup.",
      count: merchantsNeedingSetup,
      href: "/immortal/merchants",
    });
  }

  const inactiveDevices =
    devices.filter(
      (device) => !device.is_active
    ).length;

  if (inactiveDevices > 0) {
    alerts.push({
      id: "inactive-devices",
      severity: "warning",
      title: "Inactive push devices",
      description:
        "Push subscriptions are inactive and may no longer receive notifications.",
      count: inactiveDevices,
      href: "/immortal/devices",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "platform-clear",
      severity: "system",
      title: "No active platform alerts",
      description:
        "Immortal has detected no current operational issues.",
      count: 0,
      href: "/immortal",
    });
  }

  return alerts;
}
