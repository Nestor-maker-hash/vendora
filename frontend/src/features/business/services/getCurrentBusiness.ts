import { supabase } from "@/src/lib/supabase";

export async function getCurrentBusiness() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const {
    data: business,
    error,
  } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error || !business) {
    throw new Error("Business not found");
  }

  return business;
}
