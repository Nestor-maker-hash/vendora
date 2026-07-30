import { supabase } from "@/src/lib/supabase";
import { OrderStatus } from "../types/order";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}
