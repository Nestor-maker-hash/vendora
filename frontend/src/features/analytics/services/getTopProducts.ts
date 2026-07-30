import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getTopProducts() {
  const business = await getCurrentBusiness();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("business_id", business.id);

  if (ordersError) throw ordersError;

  if (!orders?.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);

  const { data: items, error } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (error) throw error;

  const map = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
    }
  >();

  for (const item of items ?? []) {
    const existing = map.get(item.product_name);

    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue +=
        Number(item.price) * item.quantity;
    } else {
      map.set(item.product_name, {
        name: item.product_name,
        quantity: item.quantity,
        revenue:
          Number(item.price) * item.quantity,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}
