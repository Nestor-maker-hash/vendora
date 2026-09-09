import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/src/features/orders/services/createOrder";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function POST(request: NextRequest) {
  try {
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
          message: "Please sign in before placing an order.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const order = await createOrder(body, user.id);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create order.",
      },
      { status: 400 }
    );
  }
}
