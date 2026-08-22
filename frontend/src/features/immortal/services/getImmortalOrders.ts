import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalOrders() {
  const { data, error } = await supabaseServer
    .from("orders")
    .select(
      `
        id,
        business_id,
        customer_name,
        customer_phone,
        customer_email,
        state,
        city,
        address,
        subtotal,
        delivery_fee,
        total,
        status,
        payment_method,
        payment_status,
        payment_reference,
        paid_at,
        payment_submitted_at,
        created_at,
        businesses (
          id,
          name,
          slug,
          currency
        )
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load platform orders: ${error.message}`
    );
  }

  return data ?? [];
}
