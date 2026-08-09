import { supabase } from "@/src/lib/supabase";

export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
