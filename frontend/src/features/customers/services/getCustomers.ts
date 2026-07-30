import { supabase } from "@/src/lib/supabase";
import { Customer } from "../types/customer";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getCustomers(): Promise<Customer[]> {
  const business = await getCurrentBusiness();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      customer_name,
      customer_phone,
      customer_email,
      total,
      created_at
    `)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const map = new Map<string, Customer>();

  for (const order of orders ?? []) {
    const key = order.customer_phone;

    if (!map.has(key)) {
      map.set(key, {
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email,
        orders: 1,
        totalSpent: Number(order.total),
        lastOrder: order.created_at,
      });
    } else {
      const customer = map.get(key)!;

      customer.orders += 1;
      customer.totalSpent += Number(order.total);

      if (
        new Date(order.created_at) >
        new Date(customer.lastOrder)
      ) {
        customer.lastOrder = order.created_at;
      }
    }
  }

  return Array.from(map.values());
}
