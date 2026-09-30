"use client";

import {
  FormEvent,
  useState,
} from "react";
import { Send } from "lucide-react";

export default function MessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        "/api/immortal/messages/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            message: trimmedMessage,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to send message."
        );
      }

      setMessage("");

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl"
    >
      {error && (
        <p className="mb-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-end gap-3">
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              if (message.trim() && !sending) {
                event.currentTarget.form?.requestSubmit();
              }
            }
          }}
          disabled={sending}
          rows={1}
          placeholder="Type a message..."
          className="min-h-11 flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={
            sending || !message.trim()
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </div>

      <p className="mt-2 text-[10px] text-slate-600">
        Enter to send · Shift+Enter for a new line
      </p>
    </form>
  );
}
