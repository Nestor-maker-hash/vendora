import { NextRequest, NextResponse } from "next/server";

import { getOrderById } from "@/src/features/orders/services/getOrderById";
import { notifyPaymentSubmitted } from "@/src/features/notifications/services/notifyPaymentSubmitted";

export async function POST(
  request: NextRequest
) {
  try {
    const { orderId } = await request.json();

    const order = await getOrderById(orderId);

    await notifyPaymentSubmitted(
      order,
      order.business.currency
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Payment notification failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
