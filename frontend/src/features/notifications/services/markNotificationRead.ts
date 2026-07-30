import { supabase } from "@/src/lib/supabase";

export async function markNotificationRead(
  id: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
