import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/src/lib/supabaseServer";

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { token } = await params;

    const { data: order, error } =
      await supabaseServer
        .from("orders")
        .select(`
          id,
          public_token,
          business_id,
          total,
          payment_method,
          payment_status,
          payment_submitted_at,
          paid_at,
          businesses!inner(
            currency,
            bank_name,
            account_name,
            account_number
          )
        `)
        .eq("public_token", token)
        .eq("payment_method", "bank_transfer")
        .single();

    if (error || !order) {
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

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        public_token: order.public_token,
        business_id: order.business_id,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        payment_submitted_at:
          order.payment_submitted_at,
        paid_at: order.paid_at,
        business,
      },
    });
  } catch (error) {
    console.error(
      "Get public order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load order.",
      },
      { status: 500 }
    );
  }
}
