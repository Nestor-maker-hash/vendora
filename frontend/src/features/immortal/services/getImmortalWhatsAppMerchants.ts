import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalWhatsAppMerchants() {
  const { data, error } = await supabaseServer
    .from("businesses")
    .select(
      "id, name, phone, email, city, state, category, slug"
    )
    .not("phone", "is", null)
    .neq("phone", "")
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load WhatsApp merchants: ${error.message}`
    );
  }

  return data ?? [];
}
