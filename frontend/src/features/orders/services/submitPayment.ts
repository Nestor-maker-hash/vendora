import { supabase } from "@/src/lib/supabase";

export async function submitPayment(orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_submitted_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}
