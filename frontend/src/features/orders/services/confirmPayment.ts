import { supabase } from "@/src/lib/supabase";

export async function confirmPayment(orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}
