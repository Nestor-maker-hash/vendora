import webpush from "web-push";
import { supabaseServer } from "@/src/lib/supabaseServer";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface SendPushNotificationData {
  businessId: string;

  title: string;
  body: string;

  url?: string;

  type?: string;
}

interface PushSubscriptionRecord {
  id: string;

  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  data: SendPushNotificationData
) {
  const { data: subscriptions, error } =
    await supabaseServer
      .from("push_subscriptions")
      .select(
        "id, endpoint, p256dh, auth"
      )
      .eq("business_id", data.businessId)
      .eq("is_active", true);

  if (error) {
    throw error;
  }

  if (!subscriptions?.length) {
    return {
      sent: 0,
      failed: 0,
    };
  }

  let sent = 0;
  let failed = 0;

  const payload = JSON.stringify({
    title: data.title,

    body: data.body,

    url:
      data.url ??
      "/dashboard/notifications",

    tag:
      data.type ??
      "vendora-notification",

    icon: "/icon.png",
    badge: "/icon.png",
  });

  for (const subscription of subscriptions as PushSubscriptionRecord[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,

          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      );

      sent++;

      await supabaseServer
        .from("push_subscriptions")
        .update({
          last_used_at:
            new Date().toISOString(),
        })
        .eq("id", subscription.id);

    } catch (error: any) {
      failed++;

      console.error(
        "Push notification failed:",
        error
      );

      /*
       * 404/410 normally means the subscription
       * is no longer valid.
       */
      if (
        error?.statusCode === 404 ||
        error?.statusCode === 410
      ) {
        await supabaseServer
          .from("push_subscriptions")
          .update({
            is_active: false,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", subscription.id);
      }
    }
  }

  return {
    sent,
    failed,
  };
}
