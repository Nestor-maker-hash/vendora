import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Info,
  XCircle,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalNotifications } from "@/src/features/immortal/services/getImmortalNotifications";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatType(type: string) {
  return type
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function typeIcon(type: string) {
  const normalized = type.toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("failed")
  ) {
    return XCircle;
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("low")
  ) {
    return CircleAlert;
  }

  if (
    normalized.includes("success") ||
    normalized.includes("paid") ||
    normalized.includes("order")
  ) {
    return CheckCircle2;
  }

  if (normalized.includes("reminder")) {
    return Clock3;
  }

  return Info;
}

function typeClass(type: string) {
  const normalized = type.toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("failed")
  ) {
    return "bg-red-500/10 text-red-400";
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("low")
  ) {
    return "bg-amber-500/10 text-amber-400";
  }

  if (
    normalized.includes("success") ||
    normalized.includes("paid") ||
    normalized.includes("order")
  ) {
    return "bg-emerald-500/10 text-emerald-400";
  }

  return "bg-slate-800 text-slate-300";
}

export default async function ImmortalNotificationsPage() {
  await getImmortalAccess();

  const notifications =
    await getImmortalNotifications();

  const unread = notifications.filter(
    (notification) => !notification.is_read
  );

  const read = notifications.length - unread.length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const today = notifications.filter(
    (notification) =>
      new Date(notification.created_at) >= todayStart
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Notification activity across every Vendora business.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Notifications"
            value={formatNumber(notifications.length)}
            icon={Bell}
          />

          <Stat
            label="Unread"
            value={formatNumber(unread.length)}
            icon={CircleAlert}
            valueClass="text-amber-400"
          />

          <Stat
            label="Read"
            value={formatNumber(read)}
            icon={CheckCircle2}
            valueClass="text-emerald-400"
          />

          <Stat
            label="Today"
            value={formatNumber(today)}
            icon={Clock3}
          />
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Notification</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {notifications.map((notification) => {
                  const Icon = typeIcon(notification.type);

                  return (
                    <tr
                      key={notification.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="max-w-[520px] px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeClass(
                              notification.type
                            )}`}
                          >
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-white">
                              {notification.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-300">
                          {notification.business?.name ??
                            "Unknown merchant"}
                        </p>

                        <p className="text-xs text-slate-600">
                          {notification.business?.slug
                            ? `/${notification.business.slug}`
                            : "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${typeClass(
                            notification.type
                          )}`}
                        >
                          {formatType(notification.type)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {notification.is_read ? (
                          <span className="text-xs font-medium text-slate-500">
                            ● Read
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-400">
                            ● Unread
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(notification.created_at)}
                      </td>
                    </tr>
                  );
                })}

                {notifications.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          {formatNumber(notifications.length)} notifications across
          the platform.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon: typeof Bell;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
          <Icon
            size={19}
            className="text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
