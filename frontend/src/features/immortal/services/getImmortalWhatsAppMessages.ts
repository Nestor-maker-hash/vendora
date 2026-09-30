import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalWhatsAppMessages() {
  const { data: conversations, error } = await supabaseServer
    .from("immortal_whatsapp_conversations")
    .select(`
      id,
      last_message_at,
      last_message_preview,
      unread_count,
      contact:immortal_whatsapp_contacts (
        id,
        phone,
        name
      )
    `)
    .order("last_message_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    throw new Error(
      `Failed to load WhatsApp conversations: ${error.message}`
    );
  }

  return conversations ?? [];
}
