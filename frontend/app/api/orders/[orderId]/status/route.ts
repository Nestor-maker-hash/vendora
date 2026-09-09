import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import type { OrderStatus } from "@/src/features/orders/types/order";
import { createBuyerNotification } from "@/src/features/buyerNotifications/services/createBuyerNotification";
import { BuyerNotificationType } from "@/src/features/buyerNotifications/constants/notificationTypes";

interface RouteContext {
  params: Promise<{
    orderId: string;
  }>;
}

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: [],
  delivered: [],
  cancelled: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();

    if (
      typeof status !== "string" ||
      !(status in allowedTransitions)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const supabaseAuth =
      await createSupabaseServerAuthClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { data: order, error: orderError } =
      await supabaseServer
        .from("orders")
        .select(`
          id,
          business_id,
          buyer_id,
          status,
          businesses!inner(owner_id, name)
        `)
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const business = Array.isArray(order.businesses)
      ? order.businesses[0]
      : order.businesses;

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to update this order.",
        },
        { status: 403 }
      );
    }

    const currentStatus = order.status as OrderStatus;
    const nextStatus = status as OrderStatus;

    if (
      !allowedTransitions[currentStatus].includes(
        nextStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot change an order from ${currentStatus} to ${nextStatus}.`,
        },
        { status: 400 }
      );
    }

    const { error: updateError } =
      await supabaseServer
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId)
        .eq("business_id", order.business_id);

    if (updateError) {
      throw updateError;
    }

    let notificationSent = true;

    const notificationConfig: Partial<
      Record<
        OrderStatus,
        {
          type: BuyerNotificationType;
          title: string;
          message: (storeName: string) => string;
        }
      >
    > = {
      confirmed: {
        type: BuyerNotificationType.ORDER_CONFIRMED,
        title: "Order confirmed",
        message: (storeName) =>
          `${storeName} has confirmed your order.`,
      },
      processing: {
        type: BuyerNotificationType.ORDER_PROCESSING,
        title: "Order processing",
        message: (storeName) =>
          `${storeName} is processing your order.`,
      },
      shipped: {
        type: BuyerNotificationType.ORDER_SHIPPED,
        title: "Order shipped",
        message: (storeName) =>
          `${storeName} has shipped your order.`,
      },
    };

    const notification = notificationConfig[nextStatus];

    if (notification && order.buyer_id && business.name) {
      try {
        await createBuyerNotification({
          buyerId: order.buyer_id,
          businessId: order.business_id,
          orderId: order.id,
          title: notification.title,
          message: notification.message(business.name),
          type: notification.type,
          link: `/buyer/orders/${order.id}`,
        });
      } catch (notificationError) {
        /*
         * The order status has already been committed.
         * A notification failure must never undo that status change.
         *
         * A duplicate means the notification already exists, so
         * treat it as successfully delivered from the API's point
         * of view. This also protects the client from showing a
         * false notification-failure message on an idempotent retry.
         */
        if (
          notificationError &&
          typeof notificationError === "object" &&
          "code" in notificationError &&
          notificationError.code === "23505"
        ) {
          notificationSent = true;
        } else {
          notificationSent = false;

          console.error(
            "Buyer order status notification failed:",
            notificationError
          );
        }
      }
    } else if (notification) {
      notificationSent = false;

      console.error(
        "Buyer order status notification could not be sent: missing buyer or business information."
      );
    }

    return NextResponse.json({
      success: true,
      notificationSent,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update order status.",
      },
      { status: 500 }
    );
  }
}
