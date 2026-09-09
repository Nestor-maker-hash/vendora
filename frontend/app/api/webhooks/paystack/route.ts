import crypto from "crypto";
import { NextResponse } from "next/server";

import { processVerifiedOnlinePayment } from "@/src/features/orders/services/processVerifiedOnlinePayment.server";

export async function POST(
  request: Request
) {
  try {
    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error(
        "Paystack secret key is not configured."
      );
    }

    const signature =
      request.headers.get(
        "x-paystack-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Paystack signature.",
        },
        { status: 401 }
      );
    }

    /*
     * Read the exact raw body before parsing it.
     *
     * Paystack signs the original request body.
     */
    const rawBody =
      await request.text();

    const expectedSignature = crypto
      .createHmac(
        "sha512",
        paystackSecretKey
      )
      .update(rawBody)
      .digest("hex");

    const signatureBuffer =
      Buffer.from(signature);

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const signatureValid =
      signatureBuffer.length ===
        expectedBuffer.length &&
      crypto.timingSafeEqual(
        signatureBuffer,
        expectedBuffer
      );

    if (!signatureValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Paystack signature.",
        },
        { status: 401 }
      );
    }

    const payload =
      JSON.parse(rawBody);

    /*
     * Paystack sends multiple webhook events.
     *
     * Only successful charges can grant value.
     */
    if (
      payload?.event !==
      "charge.success"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    const reference =
      String(
        payload?.data?.reference ?? ""
      ).trim();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment reference is missing.",
        },
        { status: 400 }
      );
    }

    /*
     * Never trust the webhook payload alone.
     *
     * Verify the transaction directly
     * with Paystack.
     */
    const verificationResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
          },
        }
      );

    const verificationResult =
      await verificationResponse.json();

    if (
      !verificationResponse.ok ||
      !verificationResult.status
    ) {
      throw new Error(
        verificationResult.message ??
          "Failed to verify Paystack payment."
      );
    }

    const transaction =
      verificationResult.data;

    if (
      String(transaction?.status ?? "")
        .trim()
        .toLowerCase() !== "success"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    /*
     * The shared processor performs the complete,
     * idempotent Vendora payment finalization:
     *
     * pending → paid
     * reduce stock once
     * notify merchant once
     */
    const result =
      await processVerifiedOnlinePayment({
        reference,
        transaction,
      });

    return NextResponse.json({
      success: true,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    console.error(
      "PAYSTACK ORDER WEBHOOK:",
      error
    );

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
