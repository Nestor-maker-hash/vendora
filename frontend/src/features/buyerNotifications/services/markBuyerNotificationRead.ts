import { supabase } from "@/src/lib/supabase";

export async function markBuyerNotificationRead(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("buyer_notifications")
    .update({
      is_read: true,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
