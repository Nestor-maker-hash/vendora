"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";
import toast from "react-hot-toast";
import {
  isPushNotificationSupported,
  subscribeToPush,
  serializePushSubscription,
  requestPushPermission,
} from "@/src/lib/push-notifications";

export default function PushNotificationBanner() {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkNotificationState() {
      if (!isPushNotificationSupported()) {
        return;
      }

      setPermission(Notification.permission);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session?.user) {
        setAuthenticated(false);
        setHasBusiness(false);
        return;
      }

      setAuthenticated(true);

      try {
        const business = await getBusinessAfterLogin(
          session.user.id
        );

        if (mounted) {
          setHasBusiness(!!business);
        }
      } catch (error) {
        console.error(
          "Failed to check notification business:",
          error
        );

        if (mounted) {
          setHasBusiness(false);
        }
      }
    }

    void checkNotificationState();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkNotificationState();
      }
    }

    window.addEventListener(
      "focus",
      handleVisibilityChange
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setAuthenticated(false);
          setHasBusiness(false);
          return;
        }

        setAuthenticated(true);

        void getBusinessAfterLogin(session.user.id)
          .then((business) => {
            if (mounted) {
              setHasBusiness(!!business);
            }
          })
          .catch((error) => {
            console.error(
              "Failed to check notification business:",
              error
            );

            if (mounted) {
              setHasBusiness(false);
            }
          });
      }
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "focus",
        handleVisibilityChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      subscription.unsubscribe();
    };
  }, []);

  async function enableNotifications() {
    try {
      setLoading(true);

      if (!isPushNotificationSupported()) {
        toast.error(
          "Push notifications are not supported on this device."
        );
        return;
      }

      const nextPermission =
        await requestPushPermission();

      setPermission(nextPermission);

      if (nextPermission !== "granted") {
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
        const errorBody = await response.text();

        console.error(
          "Push subscription API error:",
          response.status,
          errorBody
        );

        throw new Error(
          "Failed to save notification subscription."
        );
      }

      toast.success(
        "Notifications are now enabled."
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

  if (
    !authenticated ||
    !hasBusiness ||
    !isPushNotificationSupported() ||
    permission === "granted"
  ) {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-xl">
        <h3 className="font-semibold text-amber-900">
          Notifications are blocked
        </h3>

        <p className="mt-1 text-sm leading-5 text-amber-700">
          Vendora cannot send order alerts while
          notifications are blocked. Enable notifications
          for Vendora in your browser or device settings.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
          🔔
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">
            Turn on Vendora notifications
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Get instant alerts for new orders, payments,
            low stock and important business updates.
          </p>

          <button
            type="button"
            onClick={enableNotifications}
            disabled={loading}
            className="mt-3 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Enabling..."
              : "Allow Notifications"}
          </button>
        </div>
      </div>
    </div>
  );

}
