import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import type { OrderStatus } from "@/src/features/orders/types/order";

interface RouteContext {
  params: Promise<{
    orderId: string;
  }>;
}

const allowedStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();

    if (!allowedStatuses.includes(status)) {
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
          message: "You do not have permission to update this order.",
        },
        { status: 403 }
      );
    }

    const { error: updateError } =
      await supabaseServer
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .eq("business_id", order.business_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
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
