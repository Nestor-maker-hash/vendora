import crypto from "crypto";
import { NextResponse } from "next/server";

import { processVerifiedSubscriptionPayment } from "@/src/features/subscriptions/services/processVerifiedSubscriptionPayment.server";

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    if (!secretHash) {
      console.error(
        "FLUTTERWAVE_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Webhook is not configured.",
        },
        { status: 500 }
      );
    }

    const signature =
      request.headers.get("flutterwave-signature");

    const legacySignature =
      request.headers.get("verif-hash");

    const rawBody = await request.text();

    let signatureValid = false;

    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secretHash)
        .update(rawBody)
        .digest("base64");

      const signatureBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      signatureValid =
        signatureBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } else if (legacySignature) {
      const signatureBuffer = Buffer.from(legacySignature);
      const expectedBuffer = Buffer.from(secretHash);

      signatureValid =
        signatureBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    }

    if (!signatureValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    const transactionId = String(
      payload?.data?.id ?? ""
    ).trim();

    const transactionReference = String(
      payload?.data?.tx_ref ?? ""
    ).trim();

    if (!transactionId || !transactionReference) {
      return NextResponse.json(
        {
          success: false,
          message: "Webhook transaction information is missing.",
        },
        { status: 400 }
      );
    }

    if (
      payload?.type !== "charge.completed" &&
      payload?.event !== "charge.completed"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    /*
     * The webhook is authenticated by Flutterwave's
     * signature, so there is no Supabase user session.
     *
     * The processor still independently verifies the
     * transaction with Flutterwave before granting value.
     */
    const result = await processVerifiedSubscriptionPayment({
      transactionId,
      transactionReference,
    });

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    console.error("FLUTTERWAVE SUBSCRIPTION WEBHOOK:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}

