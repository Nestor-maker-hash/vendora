import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CircleAlert,
  MessageSquare,
  Plus,
  Smartphone,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";

type Broadcast = {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  channels: string[] | null;
  status: string;
  matched_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
};

function statusConfig(status: string) {
  switch (status) {
    case "sent":
      return {
        label: "Sent",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };

    case "partial":
      return {
        label: "Partial",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };

    case "failed":
      return {
        label: "Failed",
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: status,
        className:
          "border-slate-700 bg-slate-800/50 text-slate-400",
      };
  }
}

function channelIcon(channel: string) {
  if (channel === "push") {
    return Smartphone;
  }

  if (channel === "whatsapp") {
    return MessageSquare;
  }

  return Bell;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default async function ImmortalBroadcastsPage() {
  await getImmortalAccess();

  const { data: broadcasts, error } = await supabaseServer
    .from("immortal_broadcasts")
    .select(
      `
        id,
        title,
        message,
        type,
        severity,
        channels,
        status,
        matched_count,
        sent_count,
        failed_count,
        created_at,
        sent_at
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load broadcasts: ${error.message}`
    );
  }

  const rows = (broadcasts ?? []) as Broadcast[];

  const total = rows.length;

  const sent = rows.filter(
    (broadcast) => broadcast.status === "sent"
  ).length;

  const partial = rows.filter(
    (broadcast) => broadcast.status === "partial"
  ).length;

  const failed = rows.filter(
    (broadcast) => broadcast.status === "failed"
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              <MessageSquare size={14} />
              Immortal Command
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Broadcasts
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Platform-wide communication commands issued by Immortal.
            </p>
          </div>

          <Link
            href="/immortal/broadcasts/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            <Plus size={17} />
            Create Broadcast
          </Link>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-500">
              Total Broadcasts
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {total.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-sm text-slate-500">
              Sent
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {sent.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm text-slate-500">
              Partial
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              {partial.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-slate-500">
              Failed
            </p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {failed.toLocaleString()}
            </p>
          </div>
        </section>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">
            <CircleAlert
              size={28}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-4 font-semibold text-white">
              No broadcasts yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No platform communication commands have been issued.
            </p>

            <Link
              href="/immortal/broadcasts/create"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Create the first broadcast
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((broadcast) => {
              const config = statusConfig(
                broadcast.status
              );

              return (
                <div
                  key={broadcast.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold text-white">
                          {broadcast.title}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${config.className}`}
                        >
                          {config.label}
                        </span>

                        {broadcast.severity !== "info" && (
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {broadcast.severity}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 max-w-3xl text-sm text-slate-400">
                        {broadcast.message}
                      </p>

                      <p className="mt-3 text-xs text-slate-600">
                        Created{" "}
                        {formatDate(
                          broadcast.created_at
                        )}
                      </p>
                    </div>

                    <div className="grid shrink-0 grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-slate-600">
                          Matched
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {broadcast.matched_count.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">
                          Sent
                        </p>
                        <p className="mt-1 font-semibold text-emerald-400">
                          {broadcast.sent_count.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">
                          Failed
                        </p>
                        <p className="mt-1 font-semibold text-red-400">
                          {broadcast.failed_count.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
                    {broadcast.channels?.map(
                      (channel) => {
                        const Icon =
                          channelIcon(channel);

                        return (
                          <span
                            key={channel}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400"
                          >
                            <Icon size={14} />
                            {channel === "in_app"
                              ? "In-App"
                              : channel === "push"
                                ? "Web Push"
                                : "WhatsApp"}
                          </span>
                        );
                      }
                    )}

                    {broadcast.sent_at && (
                      <span className="ml-auto text-xs text-slate-600">
                        Completed{" "}
                        {formatDate(
                          broadcast.sent_at
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
