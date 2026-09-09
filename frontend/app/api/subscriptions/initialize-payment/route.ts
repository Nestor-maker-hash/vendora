import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { supabaseServer } from "@/src/lib/supabaseServer";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { convertFromNgn } from "@/src/features/currency/services/convertFromNgn.server";
import { type SupportedCurrency } from "@/src/features/currency/services/getExchangeRate.server";

interface RequestBody {
  businessId?: string;
  planId?: string;
  billingCycle?: "monthly" | "yearly";
  customerEmail?: string;
  customerName?: string;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as RequestBody;

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

    const {
      businessId,
      planId,
      billingCycle,
      customerEmail,
      customerName,
    } = body;

    if (
      !businessId ||
      !planId ||
      !billingCycle ||
      !user.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business, plan, billing cycle and email are required.",
        },
        { status: 400 }
      );
    }

    if (
      billingCycle !== "monthly" &&
      billingCycle !== "yearly"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid billing cycle.",
        },
        { status: 400 }
      );
    }

    const { data: plan, error: planError } =
      await supabaseServer
        .from("subscription_plans")
        .select(`
          id,
          name,
          description,
          monthly_price,
          yearly_price,
          is_active,
          is_public
        `)
        .eq("id", planId)
        .eq("is_active", true)
        .eq("is_public", true)
        .single();

    if (planError || !plan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected subscription plan is unavailable.",
        },
        { status: 400 }
      );
    }

    const canonicalAmount =
      billingCycle === "monthly"
        ? Number(plan.monthly_price)
        : Number(plan.yearly_price);

    if (
      !Number.isFinite(canonicalAmount) ||
      canonicalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription plan cannot be purchased.",
        },
        { status: 400 }
      );
    }

    const { data: business, error: businessError } =
      await supabaseServer
        .from("businesses")
        .select(`
          id,
          name,
          currency,
          owner_id
        `)
        .eq("id", businessId)
        .single();

    if (businessError || !business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found.",
        },
        { status: 404 }
      );
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to create a payment for this business.",
        },
        { status: 403 }
      );
    }

    const businessCurrency =
      (
        business.currency ?? "NGN"
      ).toUpperCase();

    const supportedCurrencies = [
      "NGN",
      "USD",
      "GHS",
      "KES",
    ] as const;

    if (
      !supportedCurrencies.includes(
        businessCurrency as SupportedCurrency
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Unsupported business currency: ${businessCurrency}`,
        },
        { status: 400 }
      );
    }

    const conversion =
      await convertFromNgn(
        canonicalAmount,
        businessCurrency as SupportedCurrency
      );

    const amount =
      conversion.amount;

    const currency =
      conversion.currency;

    const now = new Date();

    /*
     * Clean up old pending payment sessions for this business.
     *
     * A merchant should not accumulate multiple open
     * Flutterwave payment attempts.
     */
    const { error: cancelPendingPaymentsError } =
      await supabaseServer
        .from("subscription_payments")
        .update({
          status: "cancelled",
          updated_at: now.toISOString(),
        })
        .eq("business_id", business.id)
        .eq("status", "pending");

    if (cancelPendingPaymentsError) {
      throw new Error(
        `Failed to close previous payment sessions: ${cancelPendingPaymentsError.message}`
      );
    }

    const transactionReference =
      `vendora-sub-${business.id}-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    const paymentExpiresAt =
      new Date(
        Date.now() + 30 * 60 * 1000
      ).toISOString();

    const { data: payment, error: paymentError } =
      await supabaseServer
        .from("subscription_payments")
        .insert({
          business_id: business.id,
          plan_id: plan.id,
          provider: "flutterwave",
          transaction_reference:
            transactionReference,
          amount,
          currency,
          canonical_amount:
            conversion.canonicalAmount,
          canonical_currency:
            conversion.canonicalCurrency,
          exchange_rate:
            conversion.exchangeRate,
          billing_cycle: billingCycle,
          status: "pending",
          expires_at: paymentExpiresAt,
        })
        .select("*")
        .single();

    if (paymentError || !payment) {
      throw new Error(
        paymentError?.message ??
          "Failed to create subscription payment."
      );
    }

    const flutterwaveSecretKey =
      process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      throw new Error(
        "Flutterwave secret key is not configured."
      );
    }

    /*
     * Use the origin of the actual request.
     *
     * This ensures local development payments return
     * to the local application, while production
     * payments return to the production application.
     */
    const appUrl =
      new URL(request.url).origin;

    const redirectUrl =
      `${appUrl}/subscription/payment/callback`;

    const flutterwaveResponse =
      await fetch(
        "https://api.flutterwave.com/v3/payments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${flutterwaveSecretKey}`,
          },
          body: JSON.stringify({
            tx_ref: transactionReference,
            amount,
            currency,
            redirect_url: redirectUrl,
            customer: {
              email: user.email,
              name:
                customerName ??
                business.name,
            },
            meta: {
              business_id: business.id,
              plan_id: plan.id,
              billing_cycle: billingCycle,
              subscription_payment_id:
                payment.id,
            },
            customizations: {
              title:
                "Vendora Subscription",
              description:
                `${plan.name} plan`,
            },
          }),
        }
      );

    const flutterwaveResult =
      await flutterwaveResponse.json();

    if (
      !flutterwaveResponse.ok ||
      flutterwaveResult.status !== "success"
    ) {
      await supabaseServer
        .from("subscription_payments")
        .update({
          status: "failed",
        })
        .eq("id", payment.id);

      throw new Error(
        flutterwaveResult.message ??
          "Failed to initialize Flutterwave payment."
      );
    }

    const paymentLink =
      flutterwaveResult.data?.link;

    if (!paymentLink) {
      throw new Error(
        "Flutterwave did not return a payment link."
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionReference,
        amount,
        currency,
        canonicalAmount:
          conversion.canonicalAmount,
        canonicalCurrency:
          conversion.canonicalCurrency,
        exchangeRate:
          conversion.exchangeRate,
        billingCycle,
      },
      paymentLink,
    });
  } catch (error) {
    console.error(
      "Initialize subscription payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to initialize subscription payment.",
      },
      { status: 500 }
    );
  }
}

