import { supabase } from "@/src/lib/supabase";

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}
