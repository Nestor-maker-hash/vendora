import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/src/lib/supabaseServer";
import { notifyPaymentSubmitted } from "@/src/features/notifications/services/notifyPaymentSubmitted";

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { token } = await params;

    const { data: order, error: orderError } =
      await supabaseServer
        .from("orders")
        .select(`
          id,
          business_id,
          payment_method,
          payment_status,
          payment_submitted_at
        `)
        .eq("public_token", token)
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

    if (order.payment_method !== "bank_transfer") {
      return NextResponse.json(
        {
          success: false,
          message: "This order does not use bank transfer.",
        },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "This payment has already been confirmed.",
        },
        { status: 400 }
      );
    }

    if (order.payment_submitted_at) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
      });
    }

    const submittedAt = new Date().toISOString();

    const { data: updatedOrder, error: updateError } =
      await supabaseServer
        .from("orders")
        .update({
          payment_submitted_at: submittedAt,
        })
        .eq("id", order.id)
        .eq("public_token", token)
        .eq("payment_method", "bank_transfer")
        .is("payment_submitted_at", null)
        .select("id")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedOrder) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
      });
    }

    const { data: fullOrder, error: fullOrderError } =
      await supabaseServer
        .from("orders")
        .select(`
          *,
          business:businesses(
            currency
          )
        `)
        .eq("id", order.id)
        .single();

    if (fullOrderError || !fullOrder) {
      throw (
        fullOrderError ??
        new Error("Order not found.")
      );
    }

    try {
      await notifyPaymentSubmitted(
        fullOrder,
        fullOrder.business.currency
      );
    } catch (notificationError) {
      console.error(
        "Payment notification failed:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      alreadySubmitted: false,
      paymentSubmittedAt: submittedAt,
    });
  } catch (error) {
    console.error(
      "Submit payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit payment.",
      },
      { status: 500 }
    );
  }
}
