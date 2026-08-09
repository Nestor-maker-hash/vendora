import { supabase } from "@/src/lib/supabase";

import { getOrderById } from "./getOrderById";

export async function submitBankTransfer(orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_submitted_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    throw error;
  }

  const order = await getOrderById(orderId);

  await fetch("/api/payment-submitted", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId,
  }),
});
}
