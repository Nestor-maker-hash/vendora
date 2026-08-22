import { supabase } from "@/src/lib/supabase";

export async function getCurrentUserRole(
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role ?? null;
}
