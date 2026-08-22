"use client";


export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}


export function getPushPermission(): NotificationPermission | null {
  if (!isPushNotificationSupported()) {
    return null;
  }

  return Notification.permission;
}


export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    return "denied";
  }

  return Notification.requestPermission();
}


export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isPushNotificationSupported()) {
    throw new Error(
      "Push notifications are not supported."
    );
  }

  return navigator.serviceWorker.register(
    "/sw.js",
    {
      scope: "/",
    }
  );
}


export async function subscribeToPush(): Promise<PushSubscription> {

  const registration =
    await registerPushServiceWorker();


  let permission =
    Notification.permission;


  if (permission !== "granted") {

    permission =
      await requestPushPermission();
  }


  if (permission !== "granted") {

    throw new Error(
      "Push notification permission was not granted."
    );
  }


  const existingSubscription =
    await registration.pushManager.getSubscription();


  if (existingSubscription) {
    return existingSubscription;
  }


  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;


  if (!publicKey) {

    throw new Error(
      "VAPID public key is not configured."
    );
  }


const applicationServerKey =
  urlBase64ToUint8Array(publicKey);

return registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey:
    applicationServerKey.buffer as ArrayBuffer,
});
}


function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {

  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );


  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");


  const rawData =
    window.atob(base64);


  return Uint8Array.from(
    [...rawData].map(
      (char) =>
        char.charCodeAt(0)
    )
  );
}


export function serializePushSubscription(
  subscription: PushSubscription
) {
  const json = subscription.toJSON();

  if (
    !json.endpoint ||
    !json.keys?.p256dh ||
    !json.keys?.auth
  ) {
    throw new Error("Invalid push subscription.");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}
