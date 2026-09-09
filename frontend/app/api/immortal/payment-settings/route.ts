import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";

interface UpdatePaymentSettingsBody {
  vendora_customer_fee_percentage?: number;
  merchant_fee_percentage?: number;
  platform_commission_percentage?: number;
  paystack_fee_bearer?: "customer" | "vendora";
}

export async function PATCH(request: Request) {
  try {
    await getImmortalAccess();

    const body =
      (await request.json()) as UpdatePaymentSettingsBody;

    const customerFee = Number(
      body.vendora_customer_fee_percentage
    );

    const merchantFee = Number(
      body.merchant_fee_percentage
    );

    const platformCommission = Number(
      body.platform_commission_percentage
    );

    const paystackFeeBearer =
      body.paystack_fee_bearer;

    if (
      !Number.isFinite(customerFee) ||
      customerFee < 0 ||
      customerFee > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer fee must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(merchantFee) ||
      merchantFee < 0 ||
      merchantFee > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Merchant fee must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(platformCommission) ||
      platformCommission < 0 ||
      platformCommission > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Platform commission must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    if (
      paystackFeeBearer !== "customer" &&
      paystackFeeBearer !== "vendora"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Paystack fee bearer must be either customer or vendora.",
        },
        { status: 400 }
      );
    }

    const {
      data: existingSettings,
      error: findError,
    } = await supabaseServer
      .from("platform_payment_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingSettings) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Platform payment settings not found.",
        },
        { status: 404 }
      );
    }

    const {
      data: settings,
      error: updateError,
    } = await supabaseServer
      .from("platform_payment_settings")
      .update({
        vendora_customer_fee_percentage:
          customerFee,
        merchant_fee_percentage:
          merchantFee,
        platform_commission_percentage:
          platformCommission,
        paystack_fee_bearer:
          paystackFeeBearer,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", existingSettings.id)
      .select(
        `
          vendora_customer_fee_percentage,
          merchant_fee_percentage,
          platform_commission_percentage,
          paystack_fee_bearer
        `
      )
      .single();

    if (updateError || !settings) {
      throw new Error(
        updateError?.message ??
          "Failed to update payment settings."
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "IMMORTAL PAYMENT SETTINGS UPDATE:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update payment settings.",
      },
      { status: 500 }
    );
  }
}
