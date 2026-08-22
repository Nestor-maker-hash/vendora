"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";

type AudienceRules = {
  subscriptionPlan?: string;
  subscriptionStatus?: "active" | "inactive";
  storeSetup?: "complete" | "incomplete";
  products?: "has_products" | "none";
  orders?: "has_orders" | "none";
  pushDevice?: "active" | "inactive";
};

export default function CreateBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [rules, setRules] =
    useState<AudienceRules>({});

  const [channels, setChannels] = useState({
    in_app: true,
    push: false,
    whatsapp: false,
  });

  const [preview, setPreview] =
    useState<{
      count: number;
      audience: {
        businessId: string;
        businessName: string;
        phone: string | null;
      }[];
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function previewAudience() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/immortal/broadcasts/audience-preview",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ rules }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to preview audience"
        );
      }

      setPreview(data);
    } catch (error) {
      console.error(error);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendBroadcast() {
    if (!preview || sending) return;

    const selectedChannels = Object.entries(channels)
      .filter(([, enabled]) => enabled)
      .map(([channel]) => channel);

    if (selectedChannels.length === 0) {
      setError(
        "Select at least one delivery channel."
      );
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "/api/immortal/broadcasts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            message,
            rules,
            channels: selectedChannels,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to send broadcast."
        );
      }

      setSuccess(
        `Command sent successfully. ${data.sentCount.toLocaleString()} deliveries completed.`
      );

      setTimeout(() => {
        window.location.href =
          "/immortal/broadcasts";
      }, 1200);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to send broadcast."
      );
    } finally {
      setSending(false);
    }
  }

  function toggleChannel(
    channel: keyof typeof channels
  ) {
    setChannels((current) => ({
      ...current,
      [channel]: !current[channel],
    }));
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1000px]">
        <Link
          href="/immortal/broadcasts"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"
        >
          <ArrowLeft size={16} />
          Broadcasts
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            <MessageSquare size={14} />
            Immortal Command
          </div>

          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Create Broadcast
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Issue a targeted command to
            merchants across Vendora.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Message
            </h2>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Broadcast title"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
              />

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Write your message..."
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <Users
                size={19}
                className="text-emerald-400"
              />

              <div>
                <h2 className="font-semibold text-white">
                  Audience
                </h2>

                <p className="text-xs text-slate-500">
                  Define who receives this command.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-400">
                Subscription plan
                <select
                  value={
                    rules.subscriptionPlan ??
                    ""
                  }
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      subscriptionPlan:
                        event.target.value ||
                        undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any plan
                  </option>
                  <option value="Free Tier">
                    Free Tier
                  </option>
                </select>
              </label>

              <label className="text-sm text-slate-400">
                Subscription status
                <select
                  value={
                    rules.subscriptionStatus ??
                    ""
                  }
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      subscriptionStatus:
                        (event.target.value ||
                          undefined) as
                          | "active"
                          | "inactive"
                          | undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any status
                  </option>
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive / expired
                  </option>
                </select>
              </label>

              <label className="text-sm text-slate-400">
                Store setup
                <select
                  value={
                    rules.storeSetup ?? ""
                  }
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      storeSetup:
                        (event.target.value ||
                          undefined) as
                          | "complete"
                          | "incomplete"
                          | undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any setup state
                  </option>
                  <option value="complete">
                    Complete
                  </option>
                  <option value="incomplete">
                    Incomplete
                  </option>
                </select>
              </label>

              <label className="text-sm text-slate-400">
                Products
                <select
                  value={
                    rules.products ?? ""
                  }
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      products:
                        (event.target.value ||
                          undefined) as
                          | "has_products"
                          | "none"
                          | undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any
                  </option>
                  <option value="has_products">
                    Has products
                  </option>
                  <option value="none">
                    No products
                  </option>
                </select>
              </label>

              <label className="text-sm text-slate-400">
                Orders
                <select
                  value={rules.orders ?? ""}
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      orders:
                        (event.target.value ||
                          undefined) as
                          | "has_orders"
                          | "none"
                          | undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any
                  </option>
                  <option value="has_orders">
                    Has orders
                  </option>
                  <option value="none">
                    No orders
                  </option>
                </select>
              </label>

              <label className="text-sm text-slate-400">
                Push device
                <select
                  value={
                    rules.pushDevice ?? ""
                  }
                  onChange={(event) =>
                    setRules((current) => ({
                      ...current,
                      pushDevice:
                        (event.target.value ||
                          undefined) as
                          | "active"
                          | "inactive"
                          | undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">
                    Any
                  </option>
                  <option value="active">
                    Active device
                  </option>
                  <option value="inactive">
                    No active device
                  </option>
                </select>
              </label>
            </div>
    <button
              type="button"
              onClick={previewAudience}
              disabled={loading}
              className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {loading
                ? "Resolving..."
                : "Preview Audience"}
            </button>

            {preview && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-sm text-slate-400">
                  Matching merchants
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-400">
                  {preview.count.toLocaleString()}
                </p>

                <div className="mt-4 space-y-2">
                  {preview.audience
                    .slice(0, 5)
                    .map((merchant) => (
                      <div
                        key={
                          merchant.businessId
                        }
                        className="text-sm text-slate-300"
                      >
                        {merchant.businessName}
                      </div>
                    ))}

                  {preview.count > 5 && (
                    <p className="text-xs text-slate-600">
                      +{" "}
                      {(
                        preview.count - 5
                      ).toLocaleString()}{" "}
                      more
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Delivery Channels
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  key: "in_app" as const,
                  label: "In-App",
                  icon: Bell,
                },
                {
                  key: "push" as const,
                  label: "Web Push",
                  icon: Smartphone,
                },
                {
                  key: "whatsapp" as const,
                  label: "WhatsApp",
                  icon: MessageSquare,
                },
              ].map(
                ({
                  key,
                  label,
                  icon: Icon,
                }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      toggleChannel(key)
                    }
                    className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-sm transition ${
                      channels[key]
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-800 bg-slate-950 text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                )
              )}
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={
                !preview ||
                !title.trim() ||
                !message.trim() ||
                sending ||
                !Object.values(channels).some(Boolean)
              }
              onClick={sendBroadcast}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {sending
                ? "Sending..."
                : "Send Command"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
