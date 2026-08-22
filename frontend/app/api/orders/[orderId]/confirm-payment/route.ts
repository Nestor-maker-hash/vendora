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
          message: "You do not have permission to confirm this payment.",
        },
        { status: 403 }
      );
    }

    if (order.payment_method !== "bank_transfer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only bank transfer payments can be manually confirmed.",
        },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
      });
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "This payment cannot be confirmed.",
        },
        { status: 400 }
      );
    }

    const paidAt = new Date().toISOString();

    const { error: updateError } =
      await supabaseServer
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: paidAt,
        })
        .eq("id", orderId)
        .eq("business_id", order.business_id)
        .eq("payment_status", "pending");

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      alreadyPaid: false,
      paidAt,
    });
  } catch (error) {
    console.error(
      "Confirm payment error:",
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
