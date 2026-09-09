"use client";

import Link from "next/link";
import { useNotifications } from "../hooks/useNotifications";
import { markNotificationRead } from "../services/markNotificationRead";

export default function NotificationsList() {
  const { notifications, loading } =
    useNotifications();

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-4 w-40 max-w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="text-4xl sm:text-5xl">🔔</div>

        <h2 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">
          No notifications
        </h2>

        <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
          We'll notify you when something happens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {notifications.map((notification) => (
        <Link
  key={notification.id}
  href={notification.link ?? "#"}
  onClick={async () => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
  }}
  className={`block min-w-0 rounded-2xl border p-4 transition hover:border-emerald-400 hover:shadow-md sm:p-5 ${
    notification.is_read
      ? "bg-white"
      : "border-emerald-300 bg-emerald-50"
  }`}
>
          <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="font-semibold text-gray-900">
                {notification.title}
              </h2>

              <p className="mt-1 break-words text-sm text-gray-600 sm:mt-2 sm:text-base">
                {notification.message}
              </p>

              <p className="mt-2 text-xs text-gray-400 sm:mt-3 sm:text-sm">
                {new Date(
                  notification.created_at
                ).toLocaleString()}
              </p>

            </div>

            {!notification.is_read && (
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 sm:h-3 sm:w-3" />
            )}

          </div>
        </Link>
      ))}
    </div>
  );
}
