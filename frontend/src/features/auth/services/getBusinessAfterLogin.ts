import { supabase } from "@/src/lib/supabase";

export async function getBusinessAfterLogin(
  ownerId: string
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, currency")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
