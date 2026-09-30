import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { sendWhatsApp } from "@/src/services/providers/whatsappProvider";

export async function POST(request: Request) {
  try {
    await getImmortalAccess();

    const body = await request.json();

    const phone = String(body.phone ?? "").trim();
    const name = String(body.name ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Recipient phone number is required." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 }
      );
    }

    const { data: contact, error: contactError } =
      await supabaseServer
        .from("immortal_whatsapp_contacts")
        .upsert(
          {
            phone,
            ...(name ? { name } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone" }
        )
        .select("id")
        .single();

    if (contactError || !contact) {
      throw new Error(
        `Failed to create WhatsApp contact: ${
          contactError?.message ?? "Unknown error"
        }`
      );
    }

    const { data: conversation, error: conversationError } =
      await supabaseServer
        .from("immortal_whatsapp_conversations")
        .upsert(
          {
            contact_id: contact.id,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "contact_id",
            ignoreDuplicates: false,
          }
        )
        .select("id")
        .single();

    if (conversationError || !conversation) {
      throw new Error(
        `Failed to create WhatsApp conversation: ${
          conversationError?.message ?? "Unknown error"
        }`
      );
    }

    const whatsappResult = await sendWhatsApp({
      to: phone,
      message,
    });

    const whatsappMessageId =
      whatsappResult?.messages?.[0]?.id ?? null;

    const now = new Date().toISOString();

    const { error: messageError } =
      await supabaseServer
        .from("immortal_whatsapp_messages")
        .insert({
          conversation_id: conversation.id,
          whatsapp_message_id: whatsappMessageId,
          direction: "outbound",
          message_type: "text",
          text_content: message,
          status: "sent",
          is_read: true,
          raw_payload: whatsappResult,
          created_at: now,
        });

    if (messageError) {
      throw new Error(
        `WhatsApp message was sent but could not be saved: ${messageError.message}`
      );
    }

    const { error: updateError } =
      await supabaseServer
        .from("immortal_whatsapp_conversations")
        .update({
          last_message_at: now,
          last_message_preview: message,
          updated_at: now,
        })
        .eq("id", conversation.id);

    if (updateError) {
      throw new Error(
        `WhatsApp message was sent but conversation could not be updated: ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("IMMORTAL NEW WHATSAPP MESSAGE:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send WhatsApp message.",
      },
      { status: 500 }
    );
  }
}
