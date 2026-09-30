import Link from "next/link";
import {
  MessageSquare,
  Search,
  Store,
  ChevronRight,
} from "lucide-react";

import { getImmortalWhatsAppMessages } from "@/src/features/immortal/services/getImmortalWhatsAppMessages";
import { getImmortalWhatsAppMerchants } from "@/src/features/immortal/services/getImmortalWhatsAppMerchants";
import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString([], {
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

export default async function ImmortalMessagesPage() {
  await getImmortalAccess();

  const [
    conversations,
    merchants,
  ] = await Promise.all([
    getImmortalWhatsAppMessages(),
    getImmortalWhatsAppMerchants(),
  ]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            <MessageSquare size={14} />

            WhatsApp Messages
          </div>

          <div className="mt-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Messages
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage WhatsApp conversations across Vendora.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          {/* Conversations */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Conversations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    People who have contacted Immortal.
                  </p>
                </div>

                <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                  {conversations.length}
                </span>
              </div>

              <div className="relative mt-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="search"
                  placeholder="Search conversations..."
                  disabled
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <MessageSquare
                    size={24}
                    className="text-slate-600"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-white">
                  No conversations yet
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Incoming WhatsApp messages will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {conversations.map((conversation) => {
                  const contact = Array.isArray(
                    conversation.contact
                  )
                    ? conversation.contact[0]
                    : conversation.contact;

                  if (!contact) {
                    return null;
                  }

                  return (
                    <Link
                      key={conversation.id}
                      href={`/immortal/messages/${conversation.id}`}
                      className="flex items-center gap-4 p-5 transition hover:bg-slate-800/40"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                        {(
                          contact.name?.[0] ??
                          contact.phone[0] ??
                          "?"
                        ).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {displayName(
                              contact.name,
                              contact.phone
                            )}
                          </p>

                          {conversation.unread_count > 0 && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {conversation.last_message_preview ??
                            "No messages yet"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-slate-600">
                          {formatTime(
                            conversation.last_message_at
                          )}
                        </span>

                        <ChevronRight
                          size={16}
                          className="text-slate-700"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Merchants */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Merchants
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Start a WhatsApp conversation with any merchant.
                  </p>
                </div>

                <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                  {merchants.length}
                </span>
              </div>
            </div>

            <div className="max-h-[600px] divide-y divide-slate-800 overflow-y-auto">
              {merchants.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No merchants with phone numbers found.
                </div>
              ) : (
                merchants.map((merchant) => (
                  <Link
                    key={merchant.id}
                    href={`/immortal/messages/new?phone=${encodeURIComponent(
                      merchant.phone
                    )}&name=${encodeURIComponent(
                      merchant.name
                    )}`}
                    className="flex items-center gap-3 p-4 transition hover:bg-slate-800/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-slate-500">
                      <Store size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {merchant.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {merchant.phone}
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      className="shrink-0 text-slate-700"
                    />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
