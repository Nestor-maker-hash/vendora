import { NextRequest, NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { sendWhatsApp } from "@/src/services/providers/whatsappProvider";

export async function POST(request: NextRequest) {
  try {
    await getImmortalAccess();

    const body = await request.json();

    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation ID is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const { data: conversation, error: conversationError } =
      await supabaseServer
        .from("immortal_whatsapp_conversations")
        .select(`
          id,
          contact:immortal_whatsapp_contacts (
            id,
            phone,
            name
          )
        `)
        .eq("id", conversationId)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation not found.",
        },
        { status: 404 }
      );
    }

    const contact = Array.isArray(conversation.contact)
      ? conversation.contact[0]
      : conversation.contact;

    if (!contact?.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation contact has no phone number.",
        },
        { status: 400 }
      );
    }

    const whatsappResult = await sendWhatsApp({
      to: contact.phone,
      message,
    });

    const whatsappMessageId =
      whatsappResult?.messages?.[0]?.id ?? null;

    const { data: savedMessage, error: messageError } =
      await supabaseServer
        .from("immortal_whatsapp_messages")
        .insert({
          conversation_id: conversationId,
          whatsapp_message_id: whatsappMessageId,
          direction: "outbound",
          message_type: "text",
          text_content: message,
          status: "sent",
          is_read: true,
          raw_payload: whatsappResult,
        })
        .select(`
          id,
          whatsapp_message_id,
          direction,
          message_type,
          text_content,
          status,
          is_read,
          created_at
        `)
        .single();

    if (messageError) {
      console.error(
        "Failed to save outbound WhatsApp message:",
        messageError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp message was sent, but could not be saved.",
        },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    const { error: conversationUpdateError } =
      await supabaseServer
        .from("immortal_whatsapp_conversations")
        .update({
          last_message_at: now,
          last_message_preview: message,
          updated_at: now,
        })
        .eq("id", conversationId);

    if (conversationUpdateError) {
      console.error(
        "Failed to update WhatsApp conversation:",
        conversationUpdateError
      );
    }

    return NextResponse.json({
      success: true,
      message: savedMessage,
    });
  } catch (error) {
    console.error(
      "Immortal WhatsApp send error:",
      error
    );

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
