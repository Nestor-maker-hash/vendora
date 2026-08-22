import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import {
  resolveBroadcastAudience,
  BroadcastAudienceRules,
} from "@/src/features/immortal/services/resolveBroadcastAudience";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { createNotification } from "@/src/features/notifications/services/createNotification";
import { sendWhatsApp } from "@/src/services/providers/whatsappProvider";
import { sendPushNotification } from "@/src/services/push/pushService";
import { NotificationType } from "@/src/features/notifications/constants/notificationTypes";

type BroadcastChannel =
  | "in_app"
  | "push"
  | "whatsapp";

interface CreateBroadcastBody {
  title?: string;
  message?: string;
  severity?: "info" | "warning" | "critical";
  rules?: BroadcastAudienceRules;
  channels?: BroadcastChannel[];
}

export async function POST(request: Request) {
  try {
    const { user } = await getImmortalAccess();

    const body =
      (await request.json()) as CreateBroadcastBody;

    const title = body.title?.trim();
    const message = body.message?.trim();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "Broadcast title is required.",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Broadcast message is required.",
        },
        { status: 400 }
      );
    }

 const channels: BroadcastChannel[] = Array.from(
  new Set<BroadcastChannel>(
    body.channels ?? ["in_app"]
  )
);

    const validChannels: BroadcastChannel[] = [
      "in_app",
      "push",
      "whatsapp",
    ];

    if (
      channels.some(
        (channel) =>
          !validChannels.includes(channel)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid broadcast channel.",
        },
        { status: 400 }
      );
    }

    if (channels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one delivery channel is required.",
        },
        { status: 400 }
      );
    }

    const rules = body.rules ?? {};

    /*
     * Resolve the audience again on the server.
     * Never trust the audience from the preview request.
     */
    const audience =
      await resolveBroadcastAudience(rules);

    const { data: broadcast, error: broadcastError } =
      await supabaseServer
        .from("immortal_broadcasts")
        .insert({
          created_by: user.id,
          title,
          message,
          type: "broadcast",
          severity: body.severity ?? "info",
          audience_rules: rules,
          channels,
          status: "sending",
          matched_count: audience.length,
          sent_count: 0,
          failed_count: 0,
        })
        .select("id")
        .single();

    if (broadcastError || !broadcast) {
      throw new Error(
        broadcastError?.message ??
          "Failed to create broadcast."
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const merchant of audience) {
      for (const channel of channels) {
        const { data: delivery, error: deliveryError } =
          await supabaseServer
            .from(
              "immortal_broadcast_deliveries"
            )
            .insert({
              broadcast_id: broadcast.id,
              business_id: merchant.businessId,
              channel,
              status: "pending",
            })
            .select("id")
            .single();

        if (deliveryError || !delivery) {
          failedCount++;
          continue;
        }

        try {
          if (channel === "in_app") {
            await createNotification({
              businessId: merchant.businessId,
              title,
              message,
              type: NotificationType.BROADCAST,
              link: "/dashboard/notifications",
            });
          }

          if (channel === "push") {
            const result = await sendPushNotification({
              businessId: merchant.businessId,
              title,
              body: message,
              url: "/dashboard/notifications",
              type: NotificationType.BROADCAST,
            });

            if (result.sent === 0) {
              throw new Error(
                result.failed > 0
                  ? "Push notification delivery failed."
                  : "Merchant has no active push subscription."
              );
            }

            if (result.failed > 0) {
              throw new Error(
                `${result.failed} push notification(s) failed.`
              );
            }
          }

          if (channel === "whatsapp") {
            if (!merchant.phone) {
              throw new Error(
                "Merchant has no phone number."
              );
            }

            await sendWhatsApp({
              to: merchant.phone,
              message: `${title}\n\n${message}`,
            });
          }

          await supabaseServer
            .from(
              "immortal_broadcast_deliveries"
            )
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", delivery.id);

          sentCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Delivery failed.";

          await supabaseServer
            .from(
              "immortal_broadcast_deliveries"
            )
            .update({
              status: "failed",
              error: errorMessage,
            })
            .eq("id", delivery.id);

          failedCount++;
        }
      }
    }

    const status =
      failedCount === 0
        ? "sent"
        : sentCount === 0
          ? "failed"
          : "partial";

    await supabaseServer
      .from("immortal_broadcasts")
      .update({
        status,
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", broadcast.id);

    return NextResponse.json({
      success: true,
      broadcastId: broadcast.id,
      matchedCount: audience.length,
      sentCount,
      failedCount,
      status,
    });
  } catch (error) {
    console.error(
      "Immortal broadcast failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send broadcast.",
      },
      { status: 500 }
    );
  }
}
