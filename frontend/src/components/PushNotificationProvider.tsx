"use client";

import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  subscribeToPush,
  serializePushSubscription,
} from "@/src/lib/push-notifications";

let pushSetupPromise: Promise<void> | null = null;
let pushRegistered = false;

export default function PushNotificationProvider() {
  useEffect(() => {
    async function setupPushNotifications() {
      if (pushRegistered) {
        return;
      }

      if (pushSetupPromise) {
        await pushSetupPromise;
        return;
      }

      pushSetupPromise = (async () => {
        try {
        if (
          typeof window === "undefined" ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          return;
        }

        // Do not trigger the permission popup automatically.
        // The merchant must explicitly opt in.
        if (Notification.permission !== "granted") {
          return;
        }

        const subscription = await subscribeToPush();

        const serialized =
          serializePushSubscription(subscription);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          return;
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
            `Failed to save push subscription (${response.status}): ${errorBody}`
          );
        }

        console.log(
          "Vendora push subscription registered."
        );

        pushRegistered = true;
      } catch (error) {
        console.error(
          "Push notification setup failed:",
          error
        );
      } finally {
        pushSetupPromise = null;
      }
      })();

      await pushSetupPromise;
    }

    setupPushNotifications();
  }, []);

  return null;
}
