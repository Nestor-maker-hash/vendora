import { supabase } from "@/src/lib/supabase";
import { Order } from "../types/order";
import { OrderItem } from "../types/orderItem";

export async function getOrderById(
  id: string
): Promise<
  Order & {
    order_items: OrderItem[];
    business: {
      currency: string;
    };
  }
> {
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
  *,
  business:businesses(
    currency
  )
`)
    .eq("id", id)
    .single();

  if (error) throw error;

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) throw itemsError;

  return {
    ...(order as Order),
    order_items: (orderItems ?? []) as OrderItem[],
  };
}
