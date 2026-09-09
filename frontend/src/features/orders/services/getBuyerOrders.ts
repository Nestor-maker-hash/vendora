import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { Order } from "../types/order";

export async function getBuyerOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("Please sign in to view your orders.");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      business:businesses(
        currency
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []) as Order[];
}
