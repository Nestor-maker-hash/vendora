import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getBusinessByIdServer(id: string) {
  const { data, error } = await supabaseServer
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
