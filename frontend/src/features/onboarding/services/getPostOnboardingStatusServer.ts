import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function getPostOnboardingStatusServer() {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (businessError || !business) {
    throw new Error("Business not found");
  }

  const {
    count: productCount,
    error: productError,
  } = await supabase
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
    business.online_payment_enabled === true;

  const {
    count: deliveryZoneCount,
    error: deliveryError,
  } = await supabase
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
