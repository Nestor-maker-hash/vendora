import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { Order } from "../types/order";
import { OrderItem } from "../types/orderItem";

export type BuyerOrderDetails = Order & {
  order_items: OrderItem[];
  delivery_pin: string | null;
  business: {
    name: string;
    currency: string;
    bank_name: string | null;
    account_name: string | null;
    account_number: string | null;
  };
};

export async function getBuyerOrderById(
  id: string
): Promise<BuyerOrderDetails> {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("Please sign in to view this order.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      business:businesses(
        name,
        currency,
        bank_name,
        account_name,
        account_number
      )
    `)
    .eq("id", id)
    .eq("buyer_id", user.id)
    .single();

  if (orderError) throw orderError;

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) throw itemsError;

  const { data: deliveryVerification, error: deliveryPinError } =
    await supabase
      .from("order_delivery_verifications")
      .select("pin")
      .eq("order_id", id)
      .maybeSingle();

  if (deliveryPinError) throw deliveryPinError;

  return {
    ...(order as Order),
    delivery_pin: deliveryVerification?.pin ?? null,
    business: order.business as BuyerOrderDetails["business"],
    order_items: (orderItems ?? []) as OrderItem[],
  };
}
