import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Play,
  Video,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalWhatsAppConversation } from "@/src/features/immortal/services/getImmortalWhatsAppConversation";
import { markImmortalWhatsAppConversationRead } from "@/src/features/immortal/services/markImmortalWhatsAppConversationRead";
import MessageComposer from "./MessageComposer";

function formatTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function displayName(
  name: string | null,
  phone: string
) {
  return name?.trim() || phone;
}

function MessageContent({
  message,
}: {
  message: {
    message_type: string;
    text_content: string | null;
    file_name: string | null;
    mime_type: string | null;
    location_name: string | null;
    location_address: string | null;
    latitude: number | null;
    longitude: number | null;
    reaction_emoji: string | null;
  };
}) {
  if (message.message_type === "text") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm">
        {message.text_content || ""}
      </p>
    );
  }

  if (message.message_type === "image") {
    return (
      <div className="flex items-center gap-2">
        <ImageIcon size={18} />
        <span className="text-sm">
          Image
        </span>
      </div>
    );
  }

  if (message.message_type === "audio") {
    return (
      <div className="flex items-center gap-2">
        <Play size={16} />
        <span className="text-sm">
          Voice message
        </span>
      </div>
    );
  }

  if (message.message_type === "video") {
    return (
      <div className="flex items-center gap-2">
        <Video size={18} />
        <span className="text-sm">
          Video
        </span>
      </div>
    );
  }

  if (message.message_type === "document") {
    return (
      <div className="flex items-center gap-2">
        <FileText size={18} />
        <span className="text-sm">
          {message.file_name || "Document"}
        </span>
      </div>
    );
  }

  if (message.message_type === "location") {
    return (
      <div className="flex items-start gap-2">
        <MapPin size={18} className="mt-0.5 shrink-0" />

        <div>
          <p className="text-sm font-medium">
            {message.location_name || "Location"}
          </p>

          {message.location_address && (
            <p className="mt-1 text-xs opacity-70">
              {message.location_address}
            </p>
          )}

          {message.latitude !== null &&
            message.longitude !== null && (
              <p className="mt-1 text-xs opacity-60">
                {message.latitude}, {message.longitude}
              </p>
            )}
        </div>
      </div>
    );
  }

  if (message.message_type === "reaction") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {message.reaction_emoji || "👍"}
        </span>

        <span className="text-xs opacity-70">
          Reaction
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MessageSquare size={16} />

      <span className="text-sm">
        {message.text_content ||
          message.message_type}
      </span>
    </div>
  );
}

export default async function ImmortalWhatsAppConversationPage({
  params,
}: {
  params: Promise<{
    conversationId: string;
  }>;
}) {
  await getImmortalAccess();

  const { conversationId } = await params;

  await markImmortalWhatsAppConversationRead(
    conversationId
  );

  const { conversation, messages } =
    await getImmortalWhatsAppConversation(
      conversationId
    );

  const contact = Array.isArray(
    conversation.contact
  )
    ? conversation.contact[0]
    : conversation.contact;

  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">
          Contact not found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-6">
        <Link
          href="/immortal/messages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
          {(
            contact.name?.[0] ??
            contact.phone[0] ??
            "?"
          ).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white">
            {displayName(
              contact.name,
              contact.phone
            )}
          </h1>

          <p className="truncate text-xs text-slate-500">
            {contact.phone}
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="min-h-0 flex-1 overflow-y-auto bg-slate-950 px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-20 text-center">
              <div>
                <MessageSquare
                  size={32}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No messages yet.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const outbound =
                message.direction === "outbound";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    outbound
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[70%] ${
                      outbound
                        ? "rounded-br-md bg-emerald-600 text-white"
                        : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200"
                    }`}
                  >
                    <MessageContent
                      message={message}
                    />

                    <div
                      className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${
                        outbound
                          ? "text-emerald-100/70"
                          : "text-slate-600"
                      }`}
                    >
                      <span>
                        {formatTime(
                          message.created_at
                        )}
                      </span>

                      {outbound && (
                        <span>
                          {message.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Composer */}
      <footer className="shrink-0 border-t border-slate-800 bg-slate-950 p-4">
        <MessageComposer
          conversationId={conversationId}
        />
      </footer>
    </div>
  );
}
