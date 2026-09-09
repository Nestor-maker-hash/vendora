import { supabaseServer } from "@/src/lib/supabaseServer";

export interface PlatformPaymentSettings {
  vendora_customer_fee_percentage: number;
  merchant_fee_percentage: number;
  platform_commission_percentage: number;
  paystack_fee_bearer: "customer" | "vendora";
}

export async function getPlatformPaymentSettings(): Promise<PlatformPaymentSettings> {
  const { data, error } = await supabaseServer
    .from("platform_payment_settings")
    .select(
      `
        vendora_customer_fee_percentage,
        merchant_fee_percentage,
        platform_commission_percentage,
        paystack_fee_bearer
      `
    )
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ??
        "Failed to load platform payment settings."
    );
  }

  return {
    vendora_customer_fee_percentage:
      Number(data.vendora_customer_fee_percentage),

    merchant_fee_percentage:
      Number(data.merchant_fee_percentage),

    platform_commission_percentage:
      Number(data.platform_commission_percentage),

    paystack_fee_bearer:
      data.paystack_fee_bearer === "vendora"
        ? "vendora"
        : "customer",
  };
}
