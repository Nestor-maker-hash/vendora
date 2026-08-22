"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import toast from "react-hot-toast";
import {
  isPushNotificationSupported,
  subscribeToPush,
  serializePushSubscription,
  requestPushPermission,
} from "@/src/lib/push-notifications";

export default function PushNotificationBanner() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
  );

  async function enableNotifications() {
    try {
      setLoading(true);

      if (!isPushNotificationSupported()) {
        toast.error(
          "Push notifications are not supported on this device."
        );
        return;
      }

      const permission =
        await requestPushPermission();

      if (permission !== "granted") {
        toast.error(
          "Notification permission was not granted."
        );
        return;
      }

      const subscription =
        await subscribeToPush();

      const serialized =
        serializePushSubscription(subscription);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You must be logged in.");
      }

      console.log(
        "PUSH PAYLOAD BEFORE API:",
        JSON.stringify({
          subscription: serialized,
          platform:
            /iPhone|iPad|iPod/i.test(navigator.userAgent)
              ? "ios"
              : /Android/i.test(navigator.userAgent)
                ? "android"
                : "web",
          userAgent: navigator.userAgent,
        })
      );

      const response = await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            subscription: serialized,
            platform:
              /iPhone|iPad|iPod/i.test(
                navigator.userAgent
              )
                ? "ios"
                : /Android/i.test(
                    navigator.userAgent
                  )
                  ? "android"
                  : "web",
            userAgent: navigator.userAgent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save subscription."
        );
      }

      setEnabled(true);

      toast.success(
        "Order & offer alerts are now enabled."
      );
    } catch (error) {
      console.error(
        "Failed to enable push notifications:",
        error
      );

      toast.error(
        "Could not enable notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (enabled) {
    return null;
  }

  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "denied"
  ) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-900">
          Notifications are blocked
        </h3>

        <p className="mt-1 text-sm text-amber-700">
          Vendora cannot send order alerts because
          notification permission is blocked in your
          browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            Enable Order & Offer Alerts
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Get instant alerts for new orders, payments,
            low stock and important store updates.
          </p>
        </div>

        <button
          type="button"
          onClick={enableNotifications}
          disabled={loading}
          className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Enabling..."
            : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}
