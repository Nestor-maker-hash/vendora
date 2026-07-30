"use client";

import Link from "next/link";
import { useNotifications } from "../hooks/useNotifications";
import { markNotificationRead } from "../services/markNotificationRead";

export default function NotificationsList() {
  const { notifications, loading } =
    useNotifications();

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <div className="text-5xl">🔔</div>

        <h2 className="mt-4 text-xl font-semibold">
          No notifications
        </h2>

        <p className="mt-2 text-gray-500">
          We'll notify you when something happens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Link
  key={notification.id}
  href={notification.link ?? "#"}
  onClick={async () => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
  }}
  className={`block rounded-2xl border p-5 transition hover:border-emerald-400 hover:shadow-md ${
    notification.is_read
      ? "bg-white"
      : "border-emerald-300 bg-emerald-50"
  }`}
>
          <div className="flex items-start justify-between gap-4">

            <div className="flex-1">

              <h2 className="font-semibold text-gray-900">
                {notification.title}
              </h2>

              <p className="mt-2 text-gray-600">
                {notification.message}
              </p>

              <p className="mt-3 text-sm text-gray-400">
                {new Date(
                  notification.created_at
                ).toLocaleString()}
              </p>

            </div>

            {!notification.is_read && (
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            )}

          </div>
        </Link>
      ))}
    </div>
  );
}
