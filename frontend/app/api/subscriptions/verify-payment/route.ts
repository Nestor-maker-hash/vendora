import { NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { processVerifiedSubscriptionPayment } from "@/src/features/subscriptions/services/processVerifiedSubscriptionPayment.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const transactionId = String(
      body.transaction_id ?? ""
    ).trim();

    const transactionReference = String(
      body.tx_ref ?? ""
    ).trim();

    if (!transactionId || !transactionReference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flutterwave transaction information is missing.",
        },
        { status: 400 }
      );
    }

    const result =
      await processVerifiedSubscriptionPayment({
        transactionId,
        transactionReference,
        userId: user.id,
      });

    if (result.alreadyProcessed) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message:
          "Subscription payment already processed.",
      });
    }

    return NextResponse.json({
      success: true,
      alreadyProcessed: false,
      subscription: result.subscription,
      payment: result.payment,
    });
  } catch (error) {
    console.error(
      "VERIFY SUBSCRIPTION PAYMENT:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to verify subscription payment.";

    const status =
      message ===
        "Subscription payment could not be found."
        ? 404
        : message.includes(
            "permission to verify"
          )
          ? 403
          : message.includes(
              "Unauthorized"
            )
            ? 401
            : 400;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}
