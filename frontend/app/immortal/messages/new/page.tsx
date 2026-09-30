import Link from "next/link";
import { ArrowLeft, MessageSquare, Store } from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import NewMessageComposer from "./NewMessageComposer";

export default async function ImmortalNewWhatsAppMessagePage({
  searchParams,
}: {
  searchParams: Promise<{
    phone?: string;
    name?: string;
  }>;
}) {
  await getImmortalAccess();

  const params = await searchParams;
  const phone = params.phone?.trim() ?? "";
  const name = params.name?.trim() || phone;

  if (!phone) {
    return (
      <div className="p-6">
        <Link
          href="/immortal/messages"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Messages
        </Link>

        <div className="mt-10 text-center">
          <MessageSquare
            size={32}
            className="mx-auto text-slate-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            No merchant phone number was provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-6">
        <Link
          href="/immortal/messages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <Store size={18} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white">
            {name}
          </h1>

          <p className="truncate text-xs text-slate-500">
            {phone}
          </p>
        </div>
      </header>

      <main className="min-h-0 flex-1 bg-slate-950 px-4 py-6 md:px-8">
        <div className="mx-auto flex h-full max-w-4xl flex-col justify-end">
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
            <MessageSquare
              size={28}
              className="mx-auto text-slate-700"
            />

            <p className="mt-3 text-sm text-slate-400">
              Start a WhatsApp conversation with {name}.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              The conversation will appear in Messages after your first reply.
            </p>
          </div>

          <NewMessageComposer
            phone={phone}
            name={name}
          />
        </div>
      </main>
    </div>
  );
}
