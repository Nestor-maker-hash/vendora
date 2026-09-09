import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { Order } from "../types/order";
import { OrderItem } from "../types/orderItem";

export async function getOrderById(
  id: string
): Promise<
  Order & {
    order_items: OrderItem[];
business: {
  currency: string;

  bank_name: string | null;

  account_name: string | null;

  account_number: string | null;
};

  }
> {
  const supabase = await createSupabaseServerAuthClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
  *,
business:businesses(
  currency,
  bank_name,
  account_name,
  account_number

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
  business: order.business as {
    currency: string;
    bank_name: string | null;
    account_name: string | null;
    account_number: string | null;
  },
  order_items: (orderItems ?? []) as OrderItem[],
};
}
