import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalWhatsAppConversation(
  conversationId: string
) {
  const { data: conversation, error: conversationError } =
    await supabaseServer
      .from("immortal_whatsapp_conversations")
      .select(`
        id,
        contact_id,
        last_message_at,
        last_message_preview,
        unread_count,
        created_at,
        updated_at,
        contact:immortal_whatsapp_contacts (
          id,
          phone,
          name
        )
      `)
      .eq("id", conversationId)
      .single();

  if (conversationError) {
    throw new Error(
      `Failed to load WhatsApp conversation: ${conversationError.message}`
    );
  }

  const { data: messages, error: messagesError } =
    await supabaseServer
      .from("immortal_whatsapp_messages")
      .select(`
        id,
        whatsapp_message_id,
        direction,
        message_type,
        text_content,
        media_id,
        file_name,
        mime_type,
        latitude,
        longitude,
        location_name,
        location_address,
        reaction_emoji,
        reaction_message_id,
        status,
        is_read,
        created_at
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", {
        ascending: true,
      });

  if (messagesError) {
    throw new Error(
      `Failed to load WhatsApp messages: ${messagesError.message}`
    );
  }

  return {
    conversation,
    messages: messages ?? [],
  };
}
