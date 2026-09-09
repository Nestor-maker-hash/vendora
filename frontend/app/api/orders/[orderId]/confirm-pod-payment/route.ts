import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";

interface RouteContext {
  params: Promise<{
    orderId: string;
  }>;
}

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { orderId } = await params;

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
          status,
          payment_method,
          payment_status,
          paid_at,
          businesses!inner(owner_id)
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
            "You do not have permission to confirm this payment.",
        },
        { status: 403 }
      );
    }

    if (order.payment_method !== "pay_on_delivery") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order does not use pay on delivery.",
        },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        paidAt: order.paid_at,
      });
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment cannot be confirmed.",
        },
        { status: 400 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pay on delivery payment can only be confirmed after the order is delivered.",
        },
        { status: 400 }
      );
    }

    const paidAt = new Date().toISOString();

    const { data: updatedOrder, error: updateError } =
      await supabaseServer
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: paidAt,
        })
        .eq("id", orderId)
        .eq("business_id", order.business_id)
        .eq("payment_method", "pay_on_delivery")
        .eq("payment_status", "pending")
        .eq("status", "delivered")
        .select("id, payment_status, paid_at")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment could not be confirmed. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyPaid: false,
      paidAt,
    });
  } catch (error) {
    console.error(
      "Confirm POD payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to confirm payment.",
      },
      { status: 500 }
    );
  }
}
