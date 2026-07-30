import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getDashboardStats() {
  const business = await getCurrentBusiness();

  // Products
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  // Orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("total, customer_phone, status")
    .eq("business_id", business.id);

  if (error) throw error;

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

  return {
    revenue,
    orders: orders?.length ?? 0,
    customers,
    products: products ?? 0,
  };
}
