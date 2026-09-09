import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getAnalytics() {
  const business = await getCurrentBusiness();

  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select("id, stock")
      .eq("business_id", business.id);

  if (productsError) throw productsError;

  const { data: orders, error: ordersError } =
    await supabase
      .from("orders")
      .select(
        "total, customer_phone, status, created_at"
      )
      .eq("business_id", business.id);

  if (ordersError) throw ordersError;

  const allOrders = orders ?? [];
  const allProducts = products ?? [];

  const deliveredOrders = allOrders.filter(
    (order) => order.status === "delivered"
  );

  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const customers = new Set(
    allOrders
      .map((order) => order.customer_phone)
      .filter(Boolean)
  ).size;

  const completedOrders = deliveredOrders.length;

  const pendingOrders = allOrders.filter(
    (order) =>
      order.status !== "delivered" &&
      order.status !== "cancelled"
  ).length;

  // Average value is based on completed orders only.
  const averageOrderValue =
    completedOrders === 0
      ? 0
      : revenue / completedOrders;

  const lowStockProducts = allProducts.filter(
    (product) => Number(product.stock) <= 5
  ).length;

  /*
   * Build the complete daily revenue history.
   *
   * The chart decides which range to display:
   * 1D / 7D / 14D / 30D / All.
   *
   * Every day between the first delivered order and today
   * is included, even when revenue is zero.
   */

  const revenueMap = new Map<string, number>();

  for (const order of deliveredOrders) {
    const date = new Date(order.created_at)
      .toISOString()
      .split("T")[0];

    revenueMap.set(
      date,
      (revenueMap.get(date) ?? 0) +
        Number(order.total)
    );
  }

  const revenueHistory: {
    date: string;
    revenue: number;
  }[] = [];

  if (deliveredOrders.length > 0) {
    const dates = deliveredOrders
      .map((order) =>
        new Date(order.created_at)
          .toISOString()
          .split("T")[0]
      )
      .sort();

    const start = new Date(
      `${dates[0]}T00:00:00Z`
    );

    const today = new Date();

    today.setUTCHours(
      0,
      0,
      0,
      0
    );

    const cursor = new Date(start);

    while (cursor <= today) {
      const date = cursor
        .toISOString()
        .split("T")[0];

      revenueHistory.push({
        date,
        revenue: revenueMap.get(date) ?? 0,
      });

      cursor.setUTCDate(
        cursor.getUTCDate() + 1
      );
    }
  }

  return {
    revenue,
    orders: allOrders.length,
    customers,
    products: allProducts.length,
    completedOrders,
    pendingOrders,
    averageOrderValue,
    lowStockProducts,
    revenueHistory,
  };
}
