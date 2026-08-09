import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/src/features/orders/services/createOrder";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const order = await createOrder(body);

return NextResponse.json({
  success: true,
  order,
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}
