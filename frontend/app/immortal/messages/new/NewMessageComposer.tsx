"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewMessageComposer({
  phone,
  name,
}: {
  phone: string;
  name: string;
}) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/immortal/messages/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          name,
          message: trimmed,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to send message."
        );
      }

      router.push(
        `/immortal/messages/${result.conversationId}`
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message."
      );
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0">
      {error && (
        <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          placeholder={`Message ${name}...`}
          disabled={sending}
          className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send WhatsApp message"
        >
          <Send size={17} />
        </button>
      </div>
    </form>
  );
}
