// src/features/analytics/services/getAnalytics.ts
import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getAnalytics() {
  const business = await getCurrentBusiness();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, stock")
    .eq("business_id", business.id);

  if (productsError) throw productsError;

  // Step 1 — Select created_at alongside total, customer_phone, and status
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total, customer_phone, status, created_at")
    .eq("business_id", business.id);

  if (ordersError) throw ordersError;

  const productCount = products?.length ?? 0;
  const orderCount = orders?.length ?? 0;

  const revenue =
    orders
      ?.filter((order) => order.status === "delivered")
      .reduce(
        (sum, order) => sum + Number(order.total),
        0
      ) ?? 0;

  const customers = new Set(
    orders?.map((order) => order.customer_phone)
  ).size;

  const completedOrders =
    orders?.filter(
      (order) => order.status === "delivered"
    ).length ?? 0;

  const pendingOrders =
    orders?.filter(
      (order) => order.status !== "delivered"
    ).length ?? 0;

  const averageOrderValue =
    orderCount === 0 ? 0 : revenue / orderCount;

  const lowStockProducts =
    products?.filter(
      (product) => product.stock <= 5
    ).length ?? 0;

  // Step 2 — Build revenue history map grouped by day (YYYY-MM-DD)
  const revenueHistoryMap = new Map<string, number>();

  orders
    ?.filter((order) => order.status === "delivered")
    .forEach((order) => {
      const day = new Date(order.created_at)
        .toISOString()
        .split("T")[0];

      revenueHistoryMap.set(
        day,
        (revenueHistoryMap.get(day) ?? 0) + Number(order.total)
      );
    });

  const revenueHistory = Array.from(revenueHistoryMap.entries()).map(
    ([date, revenue]) => ({
      date,
      revenue,
    })
  );

  // Step 3 — Return the metrics along with the historical trend data
  return {
    revenue,
    orders: orderCount,
    customers,
    products: productCount,
    completedOrders,
    pendingOrders,
    averageOrderValue,
    lowStockProducts,
    revenueHistory,
  };
}

