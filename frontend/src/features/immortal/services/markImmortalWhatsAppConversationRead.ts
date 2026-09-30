import { supabaseServer } from "@/src/lib/supabaseServer";

export async function markImmortalWhatsAppConversationRead(
  conversationId: string
) {
  const now = new Date().toISOString();

  const { error: messagesError } = await supabaseServer
    .from("immortal_whatsapp_messages")
    .update({
      is_read: true,
      status: "read",
    })
    .eq("conversation_id", conversationId)
    .eq("direction", "inbound")
    .eq("is_read", false);

  if (messagesError) {
    throw new Error(
      `Failed to mark WhatsApp messages as read: ${messagesError.message}`
    );
  }

  const { error: conversationError } = await supabaseServer
    .from("immortal_whatsapp_conversations")
    .update({
      unread_count: 0,
      updated_at: now,
    })
    .eq("id", conversationId);

  if (conversationError) {
    throw new Error(
      `Failed to clear WhatsApp unread count: ${conversationError.message}`
    );
  }
}
