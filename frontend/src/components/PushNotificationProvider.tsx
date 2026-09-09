
"use client";

import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  isPushNotificationSupported,
  requestPushPermission,
  subscribeToPush,
  serializePushSubscription,
} from "@/src/lib/push-notifications";
import { getCurrentUserRole } from "@/src/features/auth/services/getCurrentUserRole";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";

const RETRY_DELAY_MS = 10 * 60 * 1000;

let pushSetupPromise: Promise<void> | null = null;
let pushRegistered = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryGeneration = 0;

function clearRetryTimer() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

async function registerPushSubscription(accessToken: string) {
  const subscription = await subscribeToPush();

  const serialized = serializePushSubscription(subscription);

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      subscription: serialized,
      platform:
        /iPhone|iPad|iPod/i.test(navigator.userAgent)
          ? "ios"
          : /Android/i.test(navigator.userAgent)
            ? "android"
            : "web",
      userAgent: navigator.userAgent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      "Push subscription API error:",
      response.status,
      errorBody
    );

    throw new Error(
      `Failed to save push subscription (${response.status}).`
    );
  }

  pushRegistered = true;
}

export default function PushNotificationProvider() {
  useEffect(() => {
    let cancelled = false;

    async function setupForMerchant() {
      if (cancelled || pushRegistered) {
        return;
      }

      if (!isPushNotificationSupported()) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.access_token) {
        return;
      }

      const role = await getCurrentUserRole(session.user.id);

      if (cancelled || role === "super_admin") {
        return;
      }

      const business = await getBusinessAfterLogin(
        session.user.id
      );

      if (cancelled || !business) {
        return;
      }

      if (Notification.permission === "granted") {
        clearRetryTimer();

        await registerPushSubscription(
          session.access_token
        );

        return;
      }

      /*
       * Permission has not been granted yet.
       *
       * Do not call Notification.requestPermission() here.
       * Browsers may suppress permission requests that are not
       * triggered by a user interaction. The global notification
       * banner owns the user-triggered permission request.
       */
      clearRetryTimer();
      return;
    }

    async function runSetup() {
      if (pushRegistered) {
        return;
      }

      if (pushSetupPromise) {
        await pushSetupPromise;
        return;
      }

      pushSetupPromise = setupForMerchant()
        .catch((error) => {
          console.error(
            "Push notification setup failed:",
            error
          );
        })
        .finally(() => {
          pushSetupPromise = null;
        });

      await pushSetupPromise;
    }

    void runSetup();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          pushRegistered = false;
          retryGeneration += 1;
          clearRetryTimer();
          return;
        }

        void runSetup();
      }
    );

    return () => {
      cancelled = true;
      retryGeneration += 1;
      clearRetryTimer();
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
