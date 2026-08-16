import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getPostOnboardingStatus() {
  const business = await getCurrentBusiness();

  const { count: productCount, error: productError } =
    await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id);

  if (productError) {
    throw productError;
  }

  const paymentReady =
    business.pay_on_delivery_enabled === true ||
    business.bank_transfer_enabled === true ||
    business.online_payment_enabled === true;

  const { count: deliveryZoneCount, error: deliveryError } =
    await supabase
      .from("delivery_zones")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id);

  if (deliveryError) {
    throw deliveryError;
  }

  const productReady = (productCount ?? 0) > 0;

  const deliveryReady = (deliveryZoneCount ?? 0) > 0;

  const setupComplete =
    productReady &&
    paymentReady &&
    deliveryReady;

  return {
    business,
    productReady,
    paymentReady,
    deliveryReady,
    setupComplete,
    storeReadyAcknowledged:
      business.store_ready_acknowledged,
  };
}
