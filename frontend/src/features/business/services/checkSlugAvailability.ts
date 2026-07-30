import { supabase } from "@/src/lib/supabase";

export async function checkSlugAvailability(
  slug: string
) {
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return !data;
}
