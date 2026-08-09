import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";
import { Order } from "../types/order";

interface GetBusinessOrdersOptions {
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  ascending?: boolean;
}

export async function getBusinessOrders(
  options: GetBusinessOrdersOptions = {}
): Promise<
  (Order & {
    business: {
      currency: string;
    };
  })[]
> {
  const business = await getCurrentBusiness();

  let query = supabase
    .from("orders")
    .select(`
  *,
  business:businesses(
    currency
  )
`)
    .eq("business_id", business.id)
    .order("created_at", {
      ascending: options.ascending ?? false,
    });

  if (options.status) {
    query = query.eq("status", options.status);
  }
if (options.paymentStatus) {
  query = query.eq(
    "payment_status",
    options.paymentStatus
  );
}

if (options.paymentMethod) {
  query = query.eq(
    "payment_method",
    options.paymentMethod
  );
}

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Order[];
}
