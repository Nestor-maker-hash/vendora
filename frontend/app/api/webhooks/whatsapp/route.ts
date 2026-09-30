import crypto from "crypto";
import { NextResponse } from "next/server";

import { supabaseServer } from "@/src/lib/supabaseServer";

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
  image?: {
    id?: string;
    mime_type?: string;
    caption?: string;
  };
  audio?: {
    id?: string;
    mime_type?: string;
  };
  video?: {
    id?: string;
    mime_type?: string;
    caption?: string;
  };
  document?: {
    id?: string;
    mime_type?: string;
    filename?: string;
    caption?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
  };
  reaction?: {
    emoji?: string;
    message_id?: string;
  };
  sticker?: {
    id?: string;
    mime_type?: string;
  };
  contacts?: unknown;
  interactive?: unknown;
  button?: unknown;
};

function verifySignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret || !signature) {
    return false;
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function getMessageType(message: WhatsAppMessage) {
  const supportedTypes = [
    "text",
    "image",
    "audio",
    "video",
    "document",
    "location",
    "reaction",
    "sticker",
    "contacts",
    "interactive",
    "button",
  ];

  return supportedTypes.includes(message.type ?? "")
    ? message.type!
    : "unknown";
}

function getTextContent(message: WhatsAppMessage) {
  switch (message.type) {
    case "text":
      return message.text?.body ?? null;

    case "image":
      return message.image?.caption ?? null;

    case "video":
      return message.video?.caption ?? null;

    case "document":
      return message.document?.caption ?? null;

    case "reaction":
      return message.reaction?.emoji ?? null;

    default:
      return null;
  }
}

function getPreview(message: WhatsAppMessage) {
  const text = getTextContent(message);

  if (text) {
    return text;
  }

  switch (message.type) {
    case "image":
      return "📷 Image";
    case "audio":
      return "🎤 Voice message";
    case "video":
      return "🎥 Video";
    case "document":
      return `📄 ${message.document?.filename ?? "Document"}`;
    case "location":
      return "📍 Location";
    case "reaction":
      return `❤️ ${message.reaction?.emoji ?? "Reaction"}`;
    case "sticker":
      return "🎟️ Sticker";
    case "contacts":
      return "👤 Contact";
    case "interactive":
      return "Interactive message";
    case "button":
      return "Button message";
    default:
      return "WhatsApp message";
  }
}

function getMediaData(message: WhatsAppMessage) {
  switch (message.type) {
    case "image":
      return {
        media_id: message.image?.id ?? null,
        mime_type: message.image?.mime_type ?? null,
      };

    case "audio":
      return {
        media_id: message.audio?.id ?? null,
        mime_type: message.audio?.mime_type ?? null,
      };

    case "video":
      return {
        media_id: message.video?.id ?? null,
        mime_type: message.video?.mime_type ?? null,
      };

    case "document":
      return {
        media_id: message.document?.id ?? null,
        mime_type: message.document?.mime_type ?? null,
        file_name: message.document?.filename ?? null,
      };

    case "sticker":
      return {
        media_id: message.sticker?.id ?? null,
        mime_type: message.sticker?.mime_type ?? null,
      };

    default:
      return {
        media_id: null,
        mime_type: null,
        file_name: null,
      };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    return new NextResponse("Webhook is not configured.", {
      status: 500,
    });
  }

  if (
    mode === "subscribe" &&
    token === verifyToken &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new NextResponse("Forbidden", {
    status: 403,
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    if (payload?.object !== "whatsapp_business_account") {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    const entries = Array.isArray(payload?.entry)
      ? payload.entry
      : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes)
        ? entry.changes
        : [];

      for (const change of changes) {
        const value = change?.value;

        if (!value) {
          continue;
        }

        const messages = Array.isArray(value.messages)
          ? value.messages
          : [];

        const contacts = Array.isArray(value.contacts)
          ? value.contacts
          : [];

        for (const message of messages as WhatsAppMessage[]) {
          const phone = String(message.from ?? "").trim();
          const whatsappMessageId = String(
            message.id ?? ""
          ).trim();

          if (!phone || !whatsappMessageId) {
            continue;
          }

          const senderContact = contacts.find(
            (contact: {
              wa_id?: string;
              profile?: {
                name?: string;
              };
            }) => String(contact?.wa_id ?? "") === phone
          );

          const senderName =
            senderContact?.profile?.name?.trim() || null;

          const { data: contact, error: contactError } =
            await supabaseServer
              .from("immortal_whatsapp_contacts")
              .upsert(
                {
                  phone,
                  ...(senderName ? { name: senderName } : {}),
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "phone",
                }
              )
              .select("id")
              .single();

          if (contactError || !contact) {
            throw new Error(
              `Failed to save WhatsApp contact: ${
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
              `Failed to save WhatsApp conversation: ${
                conversationError?.message ?? "Unknown error"
              }`
            );
          }

          const messageType = getMessageType(message);
          const media = getMediaData(message);
          const createdAt = message.timestamp
            ? new Date(
                Number(message.timestamp) * 1000
              ).toISOString()
            : new Date().toISOString();

          const { data: savedMessage, error: messageError } =
            await supabaseServer
              .from("immortal_whatsapp_messages")
              .upsert(
                {
                  conversation_id: conversation.id,
                  whatsapp_message_id: whatsappMessageId,
                  direction: "inbound",
                  message_type: messageType,
                  text_content: getTextContent(message),
                  media_id: media.media_id,
                  file_name: media.file_name ?? null,
                  mime_type: media.mime_type,
                  latitude:
                    message.location?.latitude ?? null,
                  longitude:
                    message.location?.longitude ?? null,
                  location_name:
                    message.location?.name ?? null,
                  location_address:
                    message.location?.address ?? null,
                  reaction_emoji:
                    message.reaction?.emoji ?? null,
                  reaction_message_id:
                    message.reaction?.message_id ?? null,
                  status: "received",
                  is_read: false,
                  raw_payload: message,
                  created_at: createdAt,
                },
                {
                  onConflict: "whatsapp_message_id",
                  ignoreDuplicates: true,
                }
              )
              .select("id")
              .maybeSingle();

          if (messageError) {
            throw new Error(
              `Failed to save WhatsApp message: ${messageError.message}`
            );
          }

          if (!savedMessage) {
            continue;
          }

          const preview = getPreview(message);

          const { error: conversationUpdateError } =
            await supabaseServer
              .from("immortal_whatsapp_conversations")
              .update({
                last_message_at: createdAt,
                last_message_preview: preview,
                updated_at: new Date().toISOString(),
              })
              .eq("id", conversation.id);

          if (conversationUpdateError) {
            throw new Error(
              `Failed to update WhatsApp conversation: ${conversationUpdateError.message}`
            );
          }

          const { error: unreadError } =
            await supabaseServer.rpc(
              "increment_immortal_whatsapp_unread",
              {
                conversation_uuid: conversation.id,
              }
            );

          if (unreadError) {
            throw new Error(
              `Failed to update unread count: ${unreadError.message}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("WHATSAPP WEBHOOK:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
