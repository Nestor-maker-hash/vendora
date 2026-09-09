"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";

import type { BuyerNotification } from "../types/buyerNotification";
import { getBuyerNotifications } from "../services/getBuyerNotifications";
import { markBuyerNotificationRead } from "../services/markBuyerNotificationRead";

export default function BuyerNotificationsList() {
  const [notifications, setNotifications] = useState<BuyerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getBuyerNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load buyer notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function handleNotificationClick(
    notification: BuyerNotification
  ) {
    if (notification.is_read) {
      return;
    }

    try {
      await markBuyerNotificationRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark buyer notification as read:",
        error
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <Bell
          size={34}
          className="mx-auto text-slate-300"
        />

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          No notifications yet
        </h2>

        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          We'll let you know when there is an update about your orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {notifications.map((notification) => {
        const content = (
          <div
            className={`rounded-2xl border p-4 transition sm:p-5 ${
              notification.is_read
                ? "border-slate-200 bg-white"
                : "border-emerald-200 bg-emerald-50/70"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  notification.is_read
                    ? "bg-slate-100 text-slate-500"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Bell size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">
                    {notification.title}
                  </h2>

                  {!notification.is_read && (
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  )}
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notification.message}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>

                {notification.link && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    View order
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          </div>
        );

        if (!notification.link) {
          return (
            <div key={notification.id}>
              {content}
            </div>
          );
        }

        return (
          <Link
            key={notification.id}
            href={notification.link}
            onClick={() => handleNotificationClick(notification)}
            className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
